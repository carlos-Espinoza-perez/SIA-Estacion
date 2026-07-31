using Sia.Domain.Entidades;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IEstacionesRepository
{
    Task<List<Estacion>> ObtenerTodasAsync(CancellationToken ct);
    Task<Estacion?> ObtenerPorIdAsync(Guid id, CancellationToken ct);
    Task<Estacion?> ObtenerPorClientIdAsync(string clientId, CancellationToken ct);
    Task AgregarAsync(Estacion estacion, CancellationToken ct);
    
    Task<List<EstacionTipoItem>> ObtenerAsignacionesTiposItemAsync(Guid estacionId, CancellationToken ct);
    Task EliminarAsignacionesTiposItemAsync(IEnumerable<EstacionTipoItem> asignaciones, CancellationToken ct);
    Task AgregarAsignacionTipoItemAsync(EstacionTipoItem asignacion, CancellationToken ct);
    
    Task SaveChangesAsync(CancellationToken ct);
}
