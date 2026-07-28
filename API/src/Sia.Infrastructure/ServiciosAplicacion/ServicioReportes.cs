using Microsoft.EntityFrameworkCore;
using Sia.Application.Dtos.Reportes;
using Sia.Application.Abstracciones;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioReportes
{
    private readonly SiaDbContext _db;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioReportes(SiaDbContext db, IContextoEmpresa contextoEmpresa)
    {
        _db = db;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<List<PresenciaResponse>> ObtenerPresenciaActualAsync(CancellationToken ct)
    {
        // Traemos el último evento de acceso por persona hoy, asumiendo que "Entrada" es presencia
        DateTimeOffset inicioDia = DateTimeOffset.UtcNow.Date;

        var eventos = await _db.EventosAcceso
            .Include(e => e.Persona)
            .Include(e => e.Estacion)
            .Where(e => e.FechaHoraLocal >= inicioDia && e.PersonaId != null && e.Resultado == ResultadoAcceso.Concedido)
            .GroupBy(e => e.PersonaId)
            .Select(g => g.OrderByDescending(e => e.FechaHoraLocal).First())
            .ToListAsync(ct);

        return eventos
            .Where(e => e.Direccion == DireccionAcceso.Ingreso)
            .Select(e => new PresenciaResponse
            {
                PersonaId = e.PersonaId!.Value,
                NombreCompleto = $"{e.Persona!.Nombres} {e.Persona.Apellidos}",
                UltimoEvento = e.Direccion.ToString(),
                FechaHora = e.FechaHoraLocal,
                Estacion = e.Estacion!.Nombre
            })
            .OrderBy(p => p.NombreCompleto)
            .ToList();
    }

    public async Task<List<EventoReporteResponse>> ObtenerHistorialAccesoAsync(DateTimeOffset desde, DateTimeOffset hasta, CancellationToken ct)
    {
        var eventos = await _db.EventosAcceso
            .Include(e => e.Persona)
            .Include(e => e.Estacion)
            .Where(e => e.FechaHoraLocal >= desde && e.FechaHoraLocal <= hasta)
            .OrderByDescending(e => e.FechaHoraLocal)
            .ToListAsync(ct);

        return eventos.Select(e => new EventoReporteResponse
        {
            Id = e.Id,
            PersonaNombre = e.Persona != null ? $"{e.Persona.Nombres} {e.Persona.Apellidos}" : "Desconocido",
            EstacionNombre = e.Estacion?.Nombre ?? "Desconocida",
            Direccion = e.Direccion.ToString(),
            ModoValidacion = e.ModoValidacion.ToString(),
            Resultado = e.Resultado.ToString(),
            MotivoDenegacion = e.MotivoDenegacion,
            FechaHoraLocal = e.FechaHoraLocal
        }).ToList();
    }

    public async Task<List<PrestamoVencidoResponse>> ObtenerPrestamosVencidosAsync(CancellationToken ct)
    {
        DateTimeOffset ahora = DateTimeOffset.UtcNow;

        var operaciones = await _db.OperacionesItem
            .Include(o => o.ItemEscaneado)
            .Include(o => o.Persona)
            .Where(o => o.EstadoActual != EstadoOperacionItem.Devuelto 
                     && o.FechaCompromisoDevolucion.HasValue 
                     && o.FechaCompromisoDevolucion.Value < ahora)
            .OrderBy(o => o.FechaCompromisoDevolucion)
            .ToListAsync(ct);

        return operaciones.Select(o => new PrestamoVencidoResponse
        {
            OperacionId = o.Id,
            ItemNombre = o.ItemEscaneado.Nombre,
            PersonaNombre = $"{o.Persona.Nombres} {o.Persona.Apellidos}",
            FechaCompromiso = o.FechaCompromisoDevolucion!.Value,
            DiasVencido = (ahora - o.FechaCompromisoDevolucion.Value).Days
        }).ToList();
    }

    public async Task<TrazabilidadItemResponse> ObtenerTrazabilidadItemAsync(Guid itemId, CancellationToken ct)
    {
        Item item = await _db.Items.FindAsync([itemId], ct) 
            ?? throw new Exception("Ítem no encontrado");

        var operaciones = await _db.OperacionesItem
            .Include(o => o.Persona)
            .Include(o => o.Detalles)
            .Where(o => o.ItemEscaneadoId == itemId)
            .OrderByDescending(o => o.FechaSolicitud)
            .ToListAsync(ct);

        return new TrazabilidadItemResponse
        {
            ItemId = item.Id,
            ItemNombre = item.Nombre,
            EstadoActual = item.EstadoActual.ToString(),
            Historial = operaciones.Select(o => new OperacionHistorialDto
            {
                OperacionId = o.Id,
                TipoOperacion = o.TipoOperacion.ToString(),
                PersonaNombre = $"{o.Persona.Nombres} {o.Persona.Apellidos}",
                EstadoFinal = o.EstadoActual.ToString(),
                FechaSolicitud = o.FechaSolicitud,
                FechaDevolucion = o.FechaDevolucion,
                CondicionDevolucion = o.Detalles.FirstOrDefault(d => d.ItemId == itemId)?.CondicionDevolucion?.ToString()
            }).ToList()
        };
    }
}
