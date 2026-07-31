using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IItemsRepository
{
    Task<List<TipoItem>> ObtenerTiposAsync(CancellationToken ct);
    Task<TipoItem?> ObtenerTipoPorIdAsync(Guid id, CancellationToken ct);
    Task AgregarTipoAsync(TipoItem tipo, CancellationToken ct);
    
    Task<List<AtributoDefinicion>> ObtenerAtributosAsync(Guid tipoItemId, CancellationToken ct);
    Task<AtributoDefinicion?> ObtenerAtributoPorIdAsync(Guid id, CancellationToken ct);
    Task AgregarAtributoAsync(AtributoDefinicion atributo, CancellationToken ct);
    
    Task<List<Item>> ObtenerItemsAsync(string? busqueda, Guid? tipoItemId, EstadoItem? estadoActual, CancellationToken ct);
    Task<Item?> ObtenerItemPorIdConDetallesAsync(Guid id, CancellationToken ct);
    Task<Item?> ObtenerItemPorIdAsync(Guid id, CancellationToken ct);
    Task<Item?> ObtenerItemPorQrAsync(string codigo, CancellationToken ct);
    
    Task AgregarItemAsync(Item item, CancellationToken ct);
    
    Task<List<ItemAtributoValor>> ObtenerValoresAtributoAsync(Guid itemId, CancellationToken ct);
    Task EliminarValoresAtributoAsync(IEnumerable<ItemAtributoValor> valores, CancellationToken ct);
    Task AgregarValorAtributoAsync(ItemAtributoValor valor, CancellationToken ct);
    
    Task<List<ItemComposicion>> ObtenerComponentesAsync(Guid agrupadorId, CancellationToken ct);
    Task<ItemComposicion?> ObtenerComposicionAsync(Guid agrupadorId, Guid componenteId, CancellationToken ct);
    Task AgregarComposicionAsync(ItemComposicion composicion, CancellationToken ct);
    Task EliminarComposicionAsync(ItemComposicion composicion, CancellationToken ct);
    
    Task<List<Guid>> ObtenerHijosDirectosAsync(Guid agrupadorId, CancellationToken ct);
    
    Task SaveChangesAsync(CancellationToken ct);
}
