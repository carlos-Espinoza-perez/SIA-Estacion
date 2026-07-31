using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class OperacionesRepository : IOperacionesRepository
{
    private readonly SiaDbContext _db;

    public OperacionesRepository(SiaDbContext db)
    {
        _db = db;
    }

    public async Task<OperacionItem?> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.OperacionesItem
            .Include(o => o.ItemEscaneado)
            .Include(o => o.Persona)
            .Include(o => o.Detalles).ThenInclude(d => d.Item)
            .Include(o => o.Movimientos).ThenInclude(m => m.RegistradoPorPersona)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public Task AgregarOperacionAsync(OperacionItem operacion, CancellationToken ct)
    {
        _db.OperacionesItem.Add(operacion);
        return Task.CompletedTask;
    }

    public Task AgregarOperacionDetalleAsync(OperacionItemDetalle detalle, CancellationToken ct)
    {
        _db.OperacionItemDetalles.Add(detalle);
        return Task.CompletedTask;
    }

    public Task AgregarMovimientoAsync(OperacionMovimiento movimiento, CancellationToken ct)
    {
        _db.OperacionMovimientos.Add(movimiento);
        return Task.CompletedTask;
    }

    public async Task<Item?> ObtenerItemConComponentesAsync(Guid itemId, CancellationToken ct)
    {
        return await _db.Items
            .Include(i => i.ComponentesDe)
            .FirstOrDefaultAsync(i => i.Id == itemId, ct);
    }

    public async Task<Item?> ObtenerItemBasicoAsync(Guid itemId, CancellationToken ct)
    {
        return await _db.Items.FindAsync([itemId], ct);
    }

    public async Task<List<OperacionItem>> ObtenerPrestamosVencidosAsync(DateTimeOffset ahora, CancellationToken ct)
    {
        return await _db.OperacionesItem
            .Include(o => o.ItemEscaneado)
            .Include(o => o.Persona)
            .Where(o => o.EstadoActual != Sia.Domain.Enums.EstadoOperacionItem.Devuelto 
                     && o.FechaCompromisoDevolucion.HasValue 
                     && o.FechaCompromisoDevolucion.Value < ahora)
            .OrderBy(o => o.FechaCompromisoDevolucion)
            .ToListAsync(ct);
    }

    public async Task<List<OperacionItem>> ObtenerOperacionesPorItemAsync(Guid itemId, CancellationToken ct)
    {
        return await _db.OperacionesItem
            .Include(o => o.Persona)
            .Include(o => o.Detalles)
            .Where(o => o.ItemEscaneadoId == itemId)
            .OrderByDescending(o => o.FechaSolicitud)
            .ToListAsync(ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
