using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class ItemsRepository : IItemsRepository
{
    private readonly SiaDbContext _db;

    public ItemsRepository(SiaDbContext db)
    {
        _db = db;
    }

    public async Task<List<TipoItem>> ObtenerTiposAsync(bool soloActivos, CancellationToken ct)
    {
        IQueryable<TipoItem> query = _db.TiposItem;
        if (soloActivos)
            query = query.Where(t => t.Estado);
        return await query.OrderBy(t => t.Nombre).ToListAsync(ct);
    }

    public async Task<TipoItem?> ObtenerTipoPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.TiposItem.FindAsync([id], ct);
    }

    public Task AgregarTipoAsync(TipoItem tipo, CancellationToken ct)
    {
        _db.TiposItem.Add(tipo);
        return Task.CompletedTask;
    }

    public async Task<List<AtributoDefinicion>> ObtenerAtributosAsync(Guid tipoItemId, CancellationToken ct)
    {
        return await _db.AtributosDefinicion
            .Where(a => a.TipoItemId == tipoItemId && a.Estado)
            .OrderBy(a => a.Orden)
            .ToListAsync(ct);
    }

    public async Task<AtributoDefinicion?> ObtenerAtributoPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.AtributosDefinicion.FindAsync([id], ct);
    }

    public Task AgregarAtributoAsync(AtributoDefinicion atributo, CancellationToken ct)
    {
        _db.AtributosDefinicion.Add(atributo);
        return Task.CompletedTask;
    }

    public async Task<List<Item>> ObtenerItemsAsync(string? busqueda, Guid? tipoItemId, EstadoItem? estadoActual, CancellationToken ct)
    {
        IQueryable<Item> query = _db.Items
            .Include(i => i.TipoItem)
            .Include(i => i.Estacion)
            .Where(i => i.Estado);

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(i => i.Nombre.Contains(busqueda) || i.CodigoQr.Contains(busqueda));
        if (tipoItemId.HasValue)
            query = query.Where(i => i.TipoItemId == tipoItemId.Value);
        if (estadoActual.HasValue)
            query = query.Where(i => i.EstadoActual == estadoActual.Value);

        return await query.OrderBy(i => i.Nombre).ToListAsync(ct);
    }

    public async Task<Item?> ObtenerItemPorIdConDetallesAsync(Guid id, CancellationToken ct)
    {
        return await _db.Items
            .Include(i => i.TipoItem)
            .Include(i => i.Estacion)
            .Include(i => i.AtributoValores).ThenInclude(av => av.AtributoDefinicion)
            .Include(i => i.ComponentesDe).ThenInclude(c => c.ItemComponente)
            .FirstOrDefaultAsync(i => i.Id == id, ct);
    }

    public async Task<Item?> ObtenerItemPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Items
            .Include(i => i.TipoItem)
            .Include(i => i.Estacion)
            .FirstOrDefaultAsync(i => i.Id == id, ct);
    }

    public async Task<Item?> ObtenerItemPorQrAsync(string codigo, CancellationToken ct)
    {
        return await _db.Items
            .Include(i => i.TipoItem)
            .Include(i => i.Estacion)
            .FirstOrDefaultAsync(i => i.CodigoQr == codigo, ct);
    }

    public Task AgregarItemAsync(Item item, CancellationToken ct)
    {
        _db.Items.Add(item);
        return Task.CompletedTask;
    }

    public async Task<List<ItemAtributoValor>> ObtenerValoresAtributoAsync(Guid itemId, CancellationToken ct)
    {
        return await _db.ItemAtributoValores.Where(v => v.ItemId == itemId).ToListAsync(ct);
    }

    public Task EliminarValoresAtributoAsync(IEnumerable<ItemAtributoValor> valores, CancellationToken ct)
    {
        _db.ItemAtributoValores.RemoveRange(valores);
        return Task.CompletedTask;
    }

    public Task AgregarValorAtributoAsync(ItemAtributoValor valor, CancellationToken ct)
    {
        _db.ItemAtributoValores.Add(valor);
        return Task.CompletedTask;
    }

    public async Task<List<ItemComposicion>> ObtenerComponentesAsync(Guid agrupadorId, CancellationToken ct)
    {
        return await _db.ItemComposiciones
            .Include(c => c.ItemComponente)
            .Where(c => c.ItemAgrupadorId == agrupadorId)
            .ToListAsync(ct);
    }

    public async Task<ItemComposicion?> ObtenerComposicionAsync(Guid agrupadorId, Guid componenteId, CancellationToken ct)
    {
        return await _db.ItemComposiciones
            .FirstOrDefaultAsync(c => c.ItemAgrupadorId == agrupadorId && c.ItemComponenteId == componenteId, ct);
    }

    public Task AgregarComposicionAsync(ItemComposicion composicion, CancellationToken ct)
    {
        _db.ItemComposiciones.Add(composicion);
        return Task.CompletedTask;
    }

    public Task EliminarComposicionAsync(ItemComposicion composicion, CancellationToken ct)
    {
        _db.ItemComposiciones.Remove(composicion);
        return Task.CompletedTask;
    }

    public async Task<List<Guid>> ObtenerHijosDirectosAsync(Guid agrupadorId, CancellationToken ct)
    {
        return await _db.ItemComposiciones
            .Where(c => c.ItemAgrupadorId == agrupadorId)
            .Select(c => c.ItemComponenteId)
            .ToListAsync(ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
