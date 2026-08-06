using Sia.Domain.Entidades;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IOperacionesRepository
{
    Task<List<OperacionItem>> ObtenerTodasAsync(string? busqueda, string? estado, Guid? estacionId, Guid? personaId, CancellationToken ct);
    Task<OperacionItem?> ObtenerPorIdAsync(Guid id, CancellationToken ct);
    Task AgregarOperacionAsync(OperacionItem operacion, CancellationToken ct);
    Task AgregarOperacionDetalleAsync(OperacionItemDetalle detalle, CancellationToken ct);
    Task AgregarMovimientoAsync(OperacionMovimiento movimiento, CancellationToken ct);
    
    Task<Item?> ObtenerItemConComponentesAsync(Guid itemId, CancellationToken ct);
    Task<Item?> ObtenerItemBasicoAsync(Guid itemId, CancellationToken ct);
    
    Task<List<OperacionItem>> ObtenerPrestamosVencidosAsync(DateTimeOffset ahora, CancellationToken ct);
    Task<List<OperacionItem>> ObtenerOperacionesPorItemAsync(Guid itemId, CancellationToken ct);
    
    Task SaveChangesAsync(CancellationToken ct);
}
