using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Infrastructure.Persistencia;
using System.Text.RegularExpressions;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioAcceso
{
    private readonly SiaDbContext _db;
    private readonly IServicioReconocimientoFacial _reconocimientoFacial;
    private readonly IContextoUsuario _contextoUsuario;
    private readonly IServicioAlmacenamiento _almacenamiento;

    public ServicioAcceso(
        SiaDbContext db,
        IServicioReconocimientoFacial reconocimientoFacial,
        IContextoUsuario contextoUsuario,
        IServicioAlmacenamiento almacenamiento)
    {
        _db = db;
        _reconocimientoFacial = reconocimientoFacial;
        _contextoUsuario = contextoUsuario;
        _almacenamiento = almacenamiento;
    }

    public async Task<ValidarAccesoResponse> ValidarAsync(ValidarAccesoRequest request, CancellationToken ct)
    {
        var timer = System.Diagnostics.Stopwatch.StartNew();

        if (!_contextoUsuario.EsEstacion || _contextoUsuario.EstacionId is null)
            return new ValidarAccesoResponse { Resultado = ResultadoAcceso.Denegado.ToString(), Titulo = "Error", Mensaje = "Contexto de estación inválido." };

        Guid estacionId = _contextoUsuario.EstacionId.Value;
        Guid empresaId = _contextoUsuario.EmpresaId!.Value;

        Estacion? estacion = await _db.Estaciones
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == estacionId && e.Estado, ct);

        if (estacion is null)
            return new ValidarAccesoResponse { Resultado = ResultadoAcceso.Denegado.ToString(), Titulo = "Error", Mensaje = "Estación no encontrada o inactiva." };

        if (!Enum.TryParse<DireccionAcceso>(request.Direccion, out DireccionAcceso direccion))
            return new ValidarAccesoResponse { Resultado = ResultadoAcceso.Denegado.ToString(), Titulo = "Error", Mensaje = "Dirección inválida." };

        Persona? persona = await _db.Personas
            .IgnoreQueryFilters()
            .Include(p => p.FotosReferencia)
            .FirstOrDefaultAsync(p => p.EmpresaId == empresaId && p.CodigoEstudiantil == request.CodigoEscaneado && p.Estado, ct);

        ModoValidacion modo = request.Imagen != null && request.Imagen.Length > 0 ? ModoValidacion.QrFacial : ModoValidacion.SoloQrOffline;

        if (persona is null)
        {
            await RegistrarEventoAsync(empresaId, estacionId, null, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Denegado, "Persona no existe o inactiva", request.FechaHoraLocal, ct);
            return CrearRespuesta(ResultadoAcceso.Denegado, "Acceso Denegado", "Código no registrado.", timer.ElapsedMilliseconds);
        }

        if (estacion.RequiereIdentificacion)
        {
            if (modo != ModoValidacion.QrFacial)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Denegado, "Estación requiere validación facial", request.FechaHoraLocal, ct);
                return CrearRespuesta(ResultadoAcceso.Denegado, "Acceso Denegado", "Se requiere validación facial.", timer.ElapsedMilliseconds);
            }

            FotoReferencia? fotoRef = persona.FotosReferencia.FirstOrDefault(f => f.Estado);
            if (fotoRef is null)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, "No tiene foto de referencia", request.FechaHoraLocal, ct);
                return CrearRespuesta(ResultadoAcceso.Concedido, "Revisión Manual", "No tiene foto registrada.", timer.ElapsedMilliseconds);
            }

            // Descargar foto de referencia para comparar
            // NOTA: Para producción, este flujo debería tener una caché local de embeddings en lugar de descargar la imagen cada vez
            byte[] fotoReferenciaBytes;
            try 
            {
                fotoReferenciaBytes = await _almacenamiento.DescargarArchivoAsync(fotoRef.Url, ct);
            }
            catch (Exception)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, "Error al obtener foto referencia", request.FechaHoraLocal, ct);
                return CrearRespuesta(ResultadoAcceso.Concedido, "Revisión Manual", "Error al procesar identidad.", timer.ElapsedMilliseconds);
            }

            bool coinciden = await _reconocimientoFacial.SonLaMismaPersonaAsync(fotoReferenciaBytes, request.Imagen!, ct);

            if (!coinciden)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Denegado, "Reconocimiento facial fallido", request.FechaHoraLocal, ct);
                return CrearRespuesta(ResultadoAcceso.Denegado, "Acceso Denegado", "Identidad no verificada.", timer.ElapsedMilliseconds);
            }
        }
        else if (estacion.RequiereAprobacion)
        {
            await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, "Estación requiere aprobación manual", request.FechaHoraLocal, ct);
            return CrearRespuesta(ResultadoAcceso.Concedido, "Revisión Manual", $"{persona.Nombres} {persona.Apellidos}", timer.ElapsedMilliseconds);
        }

        await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, null, request.FechaHoraLocal, ct);
        return CrearRespuesta(ResultadoAcceso.Concedido, "Acceso Permitido", $"Bienvenido, {persona.Nombres}", timer.ElapsedMilliseconds);
    }

    public async Task ProcesarLoteAsync(LoteEventosRequest request, CancellationToken ct)
    {
        if (!_contextoUsuario.EsEstacion || _contextoUsuario.EstacionId is null) return;

        Guid estacionId = _contextoUsuario.EstacionId.Value;
        Guid empresaId = _contextoUsuario.EmpresaId!.Value;

        var eventos = new List<EventoAcceso>();

        foreach (EventoOfflineDto dto in request.Eventos)
        {
            // Idempotencia: Verificar si el IdEvento (GUID string) ya existe
            // Para simplificar, asumiremos que IdEvento viene como GUID válido
            if (Guid.TryParse(dto.IdEvento, out Guid id))
            {
                bool existe = await _db.EventosAcceso.IgnoreQueryFilters().AnyAsync(e => e.Id == id, ct);
                if (existe) continue;

                if (!Enum.TryParse<DireccionAcceso>(dto.Direccion, out DireccionAcceso direccion)) continue;
                if (!Enum.TryParse<ResultadoAcceso>(dto.Resultado, out ResultadoAcceso resultado)) continue;

                Persona? persona = await _db.Personas.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(p => p.EmpresaId == empresaId && p.CodigoEstudiantil == dto.CodigoEscaneado, ct);

                eventos.Add(new EventoAcceso
                {
                    Id = id,
                    EmpresaId = empresaId,
                    EstacionId = estacionId,
                    PersonaId = persona?.Id,
                    CodigoEscaneado = dto.CodigoEscaneado,
                    Direccion = direccion,
                    ModoValidacion = ModoValidacion.SoloQrOffline, // Offline es típicamente solo código
                    Resultado = resultado,
                    MotivoDenegacion = resultado == ResultadoAcceso.Concedido ? null : "Offline",
                    FechaHoraLocal = dto.FechaHoraLocal,
                    FechaSincronizacion = DateTimeOffset.UtcNow
                });
            }
        }

        if (eventos.Count > 0)
        {
            _db.EventosAcceso.AddRange(eventos);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<SincronizacionCodigosResponse> ObtenerCodigosSincronizacionAsync(CancellationToken ct)
    {
        if (!_contextoUsuario.EsEstacion || _contextoUsuario.EmpresaId is null) 
            return new SincronizacionCodigosResponse();

        Guid empresaId = _contextoUsuario.EmpresaId.Value;

        List<string> codigos = await _db.Personas
            .IgnoreQueryFilters()
            .Where(p => p.EmpresaId == empresaId && p.Estado)
            .Select(p => p.CodigoEstudiantil)
            .ToListAsync(ct);

        return new SincronizacionCodigosResponse
        {
            Codigos = codigos,
            Timestamp = DateTimeOffset.UtcNow
        };
    }

    private async Task RegistrarEventoAsync(Guid empresaId, Guid estacionId, Guid? personaId, string codigo, DireccionAcceso direccion, ModoValidacion modo, ResultadoAcceso resultado, string? motivo, DateTimeOffset fechaLocal, CancellationToken ct)
    {
        var evento = new EventoAcceso
        {
            Id = Guid.NewGuid(),
            EmpresaId = empresaId,
            EstacionId = estacionId,
            PersonaId = personaId,
            CodigoEscaneado = codigo,
            Direccion = direccion,
            ModoValidacion = modo,
            Resultado = resultado,
            MotivoDenegacion = motivo,
            FechaHoraLocal = fechaLocal,
            FechaSincronizacion = DateTimeOffset.UtcNow
        };

        _db.EventosAcceso.Add(evento);
        await _db.SaveChangesAsync(ct);
    }

    private static ValidarAccesoResponse CrearRespuesta(ResultadoAcceso resultado, string titulo, string mensaje, long ms)
    {
        return new ValidarAccesoResponse
        {
            Resultado = resultado.ToString(),
            Titulo = titulo,
            Mensaje = mensaje,
            DuracionMs = (int)ms
        };
    }
}
