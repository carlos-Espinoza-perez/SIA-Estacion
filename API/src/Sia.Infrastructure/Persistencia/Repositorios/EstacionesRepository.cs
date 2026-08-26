using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class EstacionesRepository : IEstacionesRepository
{
    private readonly SiaDbContext _db;

    public EstacionesRepository(SiaDbContext db)
    {
        _db = db;
    }

    public async Task<List<Estacion>> ObtenerTodasAsync(CancellationToken ct)
    {
        return await _db.Estaciones
            .Include(e => e.Encargado)
            .Where(e => e.Estado)
            .OrderBy(e => e.Nombre)
            .ToListAsync(ct);
    }

    public async Task<Estacion?> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Estaciones
            .Include(e => e.Encargado)
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<Estacion?> ObtenerPorClientIdAsync(string clientId, CancellationToken ct)
    {
        return await _db.Estaciones
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.ClientId == clientId && e.Estado, ct);
    }

    public async Task<Estacion?> ObtenerPorMacAsync(string macAddress, CancellationToken ct)
    {
        return await _db.Estaciones
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.MacAddress == macAddress && e.Estado, ct);
    }

    public async Task<Estacion?> ObtenerPorCodigoVinculacionAsync(string codigo, CancellationToken ct)
    {
        return await _db.Estaciones
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.CodigoVinculacion == codigo && e.Estado, ct);
    }

    public Task AgregarAsync(Estacion estacion, CancellationToken ct)
    {
        _db.Estaciones.Add(estacion);
        return Task.CompletedTask;
    }

    public async Task<List<EstacionTipoItem>> ObtenerAsignacionesTiposItemAsync(Guid estacionId, CancellationToken ct)
    {
        return await _db.EstacionTiposItem
            .Include(eti => eti.TipoItem)
            .Where(eti => eti.EstacionId == estacionId)
            .ToListAsync(ct);
    }

    public Task EliminarAsignacionesTiposItemAsync(IEnumerable<EstacionTipoItem> asignaciones, CancellationToken ct)
    {
        _db.EstacionTiposItem.RemoveRange(asignaciones);
        return Task.CompletedTask;
    }

    public Task AgregarAsignacionTipoItemAsync(EstacionTipoItem asignacion, CancellationToken ct)
    {
        _db.EstacionTiposItem.Add(asignacion);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> ContarEstacionesActivasGlobalAsync(CancellationToken ct)
    {
        return await _db.Estaciones
            .IgnoreQueryFilters()
            .CountAsync(e => e.Estado, ct);
    }
}
