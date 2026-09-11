using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Application.Servicios;

public class ServicioAcceso
{
    private readonly IEventosRepository _eventosRepository;
    private readonly IEstacionesRepository _estacionesRepository;
    private readonly IPersonasRepository _personasRepository;
    private readonly IServicioReconocimientoFacial _reconocimientoFacial;
    private readonly IContextoUsuario _contextoUsuario;
    private readonly IServicioAlmacenamiento _almacenamiento;
    private readonly IServicioHashSecreto _hashService;

    public ServicioAcceso(
        IEventosRepository eventosRepository,
        IEstacionesRepository estacionesRepository,
        IPersonasRepository personasRepository,
        IServicioReconocimientoFacial reconocimientoFacial,
        IContextoUsuario contextoUsuario,
        IServicioAlmacenamiento almacenamiento,
        IServicioHashSecreto hashService)
    {
        _eventosRepository = eventosRepository;
        _estacionesRepository = estacionesRepository;
        _personasRepository = personasRepository;
        _reconocimientoFacial = reconocimientoFacial;
        _contextoUsuario = contextoUsuario;
        _almacenamiento = almacenamiento;
        _hashService = hashService;
    }

    public async Task<Result<ValidarAccesoResponse>> ValidarAsync(ValidarAccesoRequest request, CancellationToken ct)
    {
        var timer = System.Diagnostics.Stopwatch.StartNew();
        DateTimeOffset ahora = DateTimeOffset.UtcNow;

        if (!_contextoUsuario.EsEstacion || _contextoUsuario.EstacionId is null)
            return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Denegado, DireccionAcceso.Ingreso, "Error", "Contexto de estación inválido.", timer.ElapsedMilliseconds));

        Guid estacionId = _contextoUsuario.EstacionId.Value;
        Guid empresaId = _contextoUsuario.EmpresaId!.Value;

        Estacion? estacion = await _estacionesRepository.ObtenerPorIdAsync(estacionId, ct);
        if (estacion is null || !estacion.Estado)
            return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Denegado, DireccionAcceso.Ingreso, "Error", "Estación no encontrada o inactiva.", timer.ElapsedMilliseconds));

        // Codigo QR especial de administracion de ESTA estacion, generado desde el panel web
        // y confirmado aqui por el servidor (nunca por el firmware comparando texto localmente).
        if (!string.IsNullOrEmpty(estacion.CodigoAdminHash) && _hashService.Verificar(request.CodigoEscaneado, estacion.CodigoAdminHash))
        {
            await RegistrarEventoAsync(empresaId, estacionId, null, "ADMIN", DireccionAcceso.Ingreso, ModoValidacion.Manual, ResultadoAcceso.Concedido, "Codigo de administracion de la estacion", ahora, ct);
            var respuestaAdmin = CrearRespuesta(ResultadoAcceso.Concedido, DireccionAcceso.Ingreso, "Acceso Administrativo", "Codigo de administracion verificado.", timer.ElapsedMilliseconds);
            respuestaAdmin.EsAdmin = true;
            return Result<ValidarAccesoResponse>.Exitoso(respuestaAdmin);
        }

        Persona? persona = await _personasRepository.ObtenerPorCodigoAsync(request.CodigoEscaneado, ct);

        ModoValidacion modo = request.Imagen != null && request.Imagen.Length > 0 ? ModoValidacion.QrFacial : ModoValidacion.SoloQrOffline;

        if (persona is null || persona.EmpresaId != empresaId || !persona.Estado)
        {
            await RegistrarEventoAsync(empresaId, estacionId, null, request.CodigoEscaneado, DireccionAcceso.Ingreso, modo, ResultadoAcceso.Denegado, "Persona no existe o inactiva", ahora, ct);
            return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Denegado, DireccionAcceso.Ingreso, "Acceso Denegado", "Código no registrado.", timer.ElapsedMilliseconds));
        }

        // Dirección totalmente dinámica: se alterna según el último acceso concedido de la persona
        // (sin importar la estación), ya que el dispositivo de la estación no tiene reloj confiable.
        DireccionAcceso? ultimaDireccion = await _eventosRepository.ObtenerUltimaDireccionConcedidaAsync(persona.Id, ct);
        DireccionAcceso direccion = ultimaDireccion == DireccionAcceso.Ingreso ? DireccionAcceso.Egreso : DireccionAcceso.Ingreso;
        string nombreCompleto = $"{persona.Nombres} {persona.Apellidos}".Trim();

        if (estacion.RequiereIdentificacion)
        {
            if (modo != ModoValidacion.QrFacial)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Denegado, "Estación requiere validación facial", ahora, ct);
                return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Denegado, direccion, "Acceso Denegado", "Se requiere validación facial.", timer.ElapsedMilliseconds, nombreCompleto));
            }

            List<FotoReferencia> fotosReferencia = persona.FotosReferencia.Where(f => f.Estado).ToList();
            if (fotosReferencia.Count == 0)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, "No tiene foto de referencia", ahora, ct);
                return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Concedido, direccion, "Revisión Manual", "No tiene foto registrada.", timer.ElapsedMilliseconds, nombreCompleto));
            }

            bool coinciden = false;
            try
            {
                foreach (FotoReferencia fotoRef in fotosReferencia)
                {
                    byte[] fotoReferenciaBytes = await _almacenamiento.DescargarArchivoAsync(fotoRef.Url, ct);
                    if (await _reconocimientoFacial.SonLaMismaPersonaAsync(fotoReferenciaBytes, request.Imagen!, ct))
                    {
                        coinciden = true;
                        break;
                    }
                }
            }
            catch (Exception)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, "Error al obtener foto referencia", ahora, ct);
                return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Concedido, direccion, "Revisión Manual", "Error al procesar identidad.", timer.ElapsedMilliseconds, nombreCompleto));
            }

            if (!coinciden)
            {
                await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Denegado, "Reconocimiento facial fallido", ahora, ct);
                return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Denegado, direccion, "Acceso Denegado", "Identidad no verificada.", timer.ElapsedMilliseconds, nombreCompleto));
            }
        }
        else if (estacion.RequiereAprobacion)
        {
            await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, "Estación requiere aprobación manual", ahora, ct);
            return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Concedido, direccion, "Revisión Manual", nombreCompleto, timer.ElapsedMilliseconds, nombreCompleto));
        }

        await RegistrarEventoAsync(empresaId, estacionId, persona.Id, request.CodigoEscaneado, direccion, modo, ResultadoAcceso.Concedido, null, ahora, ct);
        string saludo = direccion == DireccionAcceso.Egreso ? $"Hasta luego, {persona.Nombres}" : $"Bienvenido, {persona.Nombres}";
        return Result<ValidarAccesoResponse>.Exitoso(CrearRespuesta(ResultadoAcceso.Concedido, direccion, "Acceso Permitido", saludo, timer.ElapsedMilliseconds, nombreCompleto));
    }

    public async Task<Result<bool>> ProcesarLoteAsync(LoteEventosRequest request, CancellationToken ct)
    {
        if (!_contextoUsuario.EsEstacion || _contextoUsuario.EstacionId is null) return Result<bool>.Fallido("ERROR", "Contexto inválido");

        Guid estacionId = _contextoUsuario.EstacionId.Value;
        Guid empresaId = _contextoUsuario.EmpresaId!.Value;

        var eventos = new List<EventoAcceso>();

        foreach (EventoOfflineDto dto in request.Eventos)
        {
            if (Guid.TryParse(dto.IdEvento, out Guid id))
            {
                bool existe = await _eventosRepository.ExisteEventoAsync(id, ct);
                if (existe) continue;

                if (!Enum.TryParse<DireccionAcceso>(dto.Direccion, out DireccionAcceso direccion)) continue;
                if (!Enum.TryParse<ResultadoAcceso>(dto.Resultado, out ResultadoAcceso resultado)) continue;

                Persona? persona = await _personasRepository.ObtenerPorCodigoAsync(dto.CodigoEscaneado, ct);
                if (persona is not null && persona.EmpresaId != empresaId) persona = null;

                eventos.Add(new EventoAcceso
                {
                    Id = id,
                    EmpresaId = empresaId,
                    EstacionId = estacionId,
                    PersonaId = persona?.Id,
                    CodigoEscaneado = dto.CodigoEscaneado,
                    Direccion = direccion,
                    ModoValidacion = ModoValidacion.SoloQrOffline,
                    Resultado = resultado,
                    MotivoDenegacion = resultado == ResultadoAcceso.Concedido ? null : "Offline",
                    FechaHoraLocal = dto.FechaHoraLocal,
                    FechaSincronizacion = DateTimeOffset.UtcNow
                });
            }
        }

        if (eventos.Count > 0)
        {
            await _eventosRepository.AgregarEventosAsync(eventos, ct);
            await _eventosRepository.SaveChangesAsync(ct);
        }

        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<SincronizacionCodigosResponse>> ObtenerCodigosSincronizacionAsync(CancellationToken ct)
    {
        if (!_contextoUsuario.EsEstacion || _contextoUsuario.EmpresaId is null) 
            return Result<SincronizacionCodigosResponse>.Exitoso(new SincronizacionCodigosResponse());

        Guid empresaId = _contextoUsuario.EmpresaId.Value;

        List<string> codigos = await _personasRepository.ObtenerCodigosSincronizacionAsync(empresaId, ct);

        return Result<SincronizacionCodigosResponse>.Exitoso(new SincronizacionCodigosResponse
        {
            Codigos = codigos,
            Timestamp = DateTimeOffset.UtcNow
        });
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

        await _eventosRepository.AgregarEventoAsync(evento, ct);
        await _eventosRepository.SaveChangesAsync(ct);
    }

    private static ValidarAccesoResponse CrearRespuesta(ResultadoAcceso resultado, DireccionAcceso direccion, string titulo, string mensaje, long ms, string nombrePersona = "")
    {
        return new ValidarAccesoResponse
        {
            Resultado = resultado.ToString(),
            Direccion = direccion.ToString(),
            Titulo = titulo,
            Mensaje = mensaje,
            NombrePersona = nombrePersona,
            DuracionMs = (int)ms
        };
    }
}
