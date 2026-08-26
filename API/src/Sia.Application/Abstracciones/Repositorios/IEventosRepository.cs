using Sia.Domain.Entidades;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IEventosRepository
{
    Task AgregarEventoAsync(EventoAcceso evento, CancellationToken ct);
    Task AgregarEventosAsync(IEnumerable<EventoAcceso> eventos, CancellationToken ct);
    Task<bool> ExisteEventoAsync(Guid id, CancellationToken ct);
    Task<List<EventoAcceso>> ObtenerPresenciaActualAsync(DateTimeOffset inicioDia, CancellationToken ct);
    Task<List<EventoAcceso>> ObtenerHistorialAccesoAsync(DateTimeOffset desde, DateTimeOffset hasta, CancellationToken ct);
    Task<int> ContarAuditoriaAsync(DateTimeOffset? desde, DateTimeOffset? hasta, string? entidad, string? busqueda, CancellationToken ct);
    Task<List<AuditoriaCambio>> ObtenerAuditoriaAsync(DateTimeOffset? desde, DateTimeOffset? hasta, string? entidad, string? busqueda, int pagina, int limite, CancellationToken ct);
    Task<int> ContarAccesosHoyGlobalAsync(DateTimeOffset hoy, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
