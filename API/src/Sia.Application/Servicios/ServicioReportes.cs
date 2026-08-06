using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Reportes;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Application.Servicios;

public class ServicioReportes
{
    private readonly IEventosRepository _eventosRepository;
    private readonly IOperacionesRepository _operacionesRepository;
    private readonly IItemsRepository _itemsRepository;

    public ServicioReportes(
        IEventosRepository eventosRepository,
        IOperacionesRepository operacionesRepository,
        IItemsRepository itemsRepository)
    {
        _eventosRepository = eventosRepository;
        _operacionesRepository = operacionesRepository;
        _itemsRepository = itemsRepository;
    }

    public async Task<Result<List<PresenciaResponse>>> ObtenerPresenciaActualAsync(CancellationToken ct)
    {
        DateTimeOffset inicioDia = DateTimeOffset.UtcNow.Date;

        List<EventoAcceso> eventos = await _eventosRepository.ObtenerPresenciaActualAsync(inicioDia, ct);

        var response = eventos
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

        return Result<List<PresenciaResponse>>.Exitoso(response);
    }

    public async Task<Result<List<EventoReporteResponse>>> ObtenerHistorialAccesoAsync(DateTimeOffset desde, DateTimeOffset hasta, CancellationToken ct)
    {
        List<EventoAcceso> eventos = await _eventosRepository.ObtenerHistorialAccesoAsync(desde, hasta, ct);

        var response = eventos.Select(e => new EventoReporteResponse
        {
            Id = e.Id,
            PersonaNombre = e.Persona != null ? $"{e.Persona.Nombres} {e.Persona.Apellidos}" : "Desconocido",
            EstacionNombre = e.Estacion?.Nombre ?? "Desconocida",
            Direccion = e.Direccion.ToString(),
            ModoValidacion = e.ModoValidacion.ToString(),
            Resultado = e.Resultado.ToString(),
            MotivoDenegacion = e.MotivoDenegacion,
            FotoEvidenciaUrl = e.FotoEvidenciaUrl,
            FechaHoraLocal = e.FechaHoraLocal
        }).ToList();

        return Result<List<EventoReporteResponse>>.Exitoso(response);
    }

    public async Task<Result<List<PrestamoVencidoResponse>>> ObtenerPrestamosVencidosAsync(CancellationToken ct)
    {
        DateTimeOffset ahora = DateTimeOffset.UtcNow;

        List<OperacionItem> operaciones = await _operacionesRepository.ObtenerPrestamosVencidosAsync(ahora, ct);

        var response = operaciones.Select(o => new PrestamoVencidoResponse
        {
            OperacionId = o.Id,
            ItemNombre = o.ItemEscaneado!.Nombre,
            PersonaNombre = $"{o.Persona!.Nombres} {o.Persona.Apellidos}",
            FechaCompromiso = o.FechaCompromisoDevolucion!.Value,
            DiasVencido = (ahora - o.FechaCompromisoDevolucion.Value).Days
        }).ToList();

        return Result<List<PrestamoVencidoResponse>>.Exitoso(response);
    }

    public async Task<Result<TrazabilidadItemResponse>> ObtenerTrazabilidadItemAsync(Guid itemId, CancellationToken ct)
    {
        Item? item = await _itemsRepository.ObtenerItemPorIdAsync(itemId, ct);
        if (item is null)
            return Result<TrazabilidadItemResponse>.Fallido("ITEM_NO_ENCONTRADO", "Ítem no encontrado");

        List<OperacionItem> operaciones = await _operacionesRepository.ObtenerOperacionesPorItemAsync(itemId, ct);

        var response = new TrazabilidadItemResponse
        {
            ItemId = item.Id,
            ItemNombre = item.Nombre,
            EstadoActual = item.EstadoActual.ToString(),
            Historial = operaciones.Select(o => new OperacionHistorialDto
            {
                OperacionId = o.Id,
                TipoOperacion = o.TipoOperacion.ToString(),
                PersonaNombre = $"{o.Persona!.Nombres} {o.Persona.Apellidos}",
                EstadoFinal = o.EstadoActual.ToString(),
                FechaSolicitud = o.FechaSolicitud,
                FechaDevolucion = o.FechaDevolucion,
                CondicionDevolucion = o.Detalles.FirstOrDefault(d => d.ItemId == itemId)?.CondicionDevolucion?.ToString()
            }).ToList()
        };

        return Result<TrazabilidadItemResponse>.Exitoso(response);
    }

    public async Task<Result<List<AuditoriaResponse>>> ObtenerAuditoriaAsync(DateTimeOffset? desde, DateTimeOffset? hasta, string? entidad, CancellationToken ct)
    {
        List<AuditoriaCambio> registros = await _eventosRepository.ObtenerAuditoriaAsync(desde, hasta, entidad, ct);

        var response = registros.Select(a => new AuditoriaResponse
        {
            Id = a.Id,
            Entidad = a.Entidad,
            EntidadId = a.EntidadId,
            Accion = a.Accion,
            Descripcion = a.Descripcion,
            Origen = a.Origen,
            EstacionId = a.EstacionId,
            UserId = a.UserId,
            FechaHora = a.FechaHora
        }).ToList();

        return Result<List<AuditoriaResponse>>.Exitoso(response);
    }
}
