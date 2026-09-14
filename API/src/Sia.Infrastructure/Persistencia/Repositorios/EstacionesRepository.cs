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
        string limpia = macAddress.Replace(":", "").Replace("-", "").Replace(" ", "").ToUpperInvariant();
        return await _db.Estaciones
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => 
                (e.MacAddress == macAddress || 
                 e.MacAddress == limpia || 
                 (e.MacAddress != null && e.MacAddress.Replace(":", "").Replace("-", "") == limpia)) 
                && e.Estado, ct);
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

    public async Task<Dictionary<Guid, int>> ContarAccesosHoyPorEstacionAsync(CancellationToken ct)
    {
        DateTimeOffset inicioDia = DateTimeOffset.UtcNow.Date;
        DateTimeOffset finDia = inicioDia.AddDays(1);

        return await _db.EventosAcceso
            .Where(e => e.FechaHoraLocal >= inicioDia && e.FechaHoraLocal < finDia)
            .GroupBy(e => e.EstacionId)
            .Select(g => new { EstacionId = g.Key, Cantidad = g.Count() })
            .ToDictionaryAsync(x => x.EstacionId, x => x.Cantidad, ct);
    }

    public async Task<Dictionary<Guid, int>> ContarOperacionesHoyPorEstacionAsync(CancellationToken ct)
    {
        DateTimeOffset inicioDia = DateTimeOffset.UtcNow.Date;
        DateTimeOffset finDia = inicioDia.AddDays(1);

        return await _db.OperacionesItem
            .Where(o => o.FechaSolicitud >= inicioDia && o.FechaSolicitud < finDia)
            .GroupBy(o => o.EstacionId)
            .Select(g => new { EstacionId = g.Key, Cantidad = g.Count() })
            .ToDictionaryAsync(x => x.EstacionId, x => x.Cantidad, ct);
    }

    public async Task<List<EventoAcceso>> ObtenerUltimosEventosAsync(int limite, CancellationToken ct)
    {
        return await _db.EventosAcceso
            .Include(e => e.Persona)
            .OrderByDescending(e => e.FechaHoraLocal)
            .Take(limite)
            .ToListAsync(ct);
    }

    public async Task<List<OperacionItem>> ObtenerUltimasOperacionesAsync(int limite, CancellationToken ct)
    {
        return await _db.OperacionesItem
            .Include(o => o.ItemEscaneado)
            .Include(o => o.Persona)
            .OrderByDescending(o => o.FechaSolicitud)
            .Take(limite)
            .ToListAsync(ct);
    }

    public async Task<Dictionary<Guid, string>> ObtenerNombresPorIdsAsync(IEnumerable<Guid> ids, CancellationToken ct)
    {
        List<Guid> idsLista = ids.Distinct().ToList();
        if (idsLista.Count == 0) return new Dictionary<Guid, string>();

        return await _db.Estaciones
            .IgnoreQueryFilters()
            .Where(e => idsLista.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => e.Nombre, ct);
    }
}
