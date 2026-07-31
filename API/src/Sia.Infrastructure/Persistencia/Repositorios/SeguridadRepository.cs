using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class SeguridadRepository : ISeguridadRepository
{
    private readonly SiaDbContext _db;

    public SeguridadRepository(SiaDbContext db)
    {
        _db = db;
    }

    public async Task<List<Privilegio>> ObtenerPrivilegiosAsync(CancellationToken ct)
    {
        return await _db.Privilegios
            .IgnoreQueryFilters()
            .Where(p => p.Estado)
            .OrderBy(p => p.Modulo).ThenBy(p => p.Nombre)
            .ToListAsync(ct);
    }

    public async Task<Privilegio?> ObtenerPrivilegioPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Privilegios
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public Task AgregarPrivilegioAsync(Privilegio privilegio, CancellationToken ct)
    {
        _db.Privilegios.Add(privilegio);
        return Task.CompletedTask;
    }

    public async Task<List<NivelPermiso>> ObtenerNivelesPermisoAsync(CancellationToken ct)
    {
        return await _db.NivelesPermiso
            .IgnoreQueryFilters()
            .Where(n => n.Estado)
            .OrderBy(n => n.Orden)
            .ToListAsync(ct);
    }

    public async Task<NivelPermiso?> ObtenerNivelPermisoPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.NivelesPermiso
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(n => n.Id == id, ct);
    }

    public Task AgregarNivelPermisoAsync(NivelPermiso nivelPermiso, CancellationToken ct)
    {
        _db.NivelesPermiso.Add(nivelPermiso);
        return Task.CompletedTask;
    }

    public async Task<List<RolPrivilegio>> ObtenerPrivilegiosRolAsync(string roleId, CancellationToken ct)
    {
        return await _db.RolPrivilegios
            .IgnoreQueryFilters()
            .Include(rp => rp.Privilegio)
            .Include(rp => rp.NivelPermiso)
            .Where(rp => rp.RoleId == roleId && rp.Estado)
            .ToListAsync(ct);
    }

    public async Task<List<RolPrivilegio>> ObtenerPrivilegiosRolesAsync(IEnumerable<string> roleIds, CancellationToken ct)
    {
        return await _db.RolPrivilegios
            .IgnoreQueryFilters()
            .Include(rp => rp.Privilegio)
            .Include(rp => rp.NivelPermiso)
            .Where(rp => roleIds.Contains(rp.RoleId) && rp.Estado)
            .ToListAsync(ct);
    }

    public Task EliminarPrivilegiosRolAsync(IEnumerable<RolPrivilegio> asignaciones, CancellationToken ct)
    {
        _db.RolPrivilegios.RemoveRange(asignaciones);
        return Task.CompletedTask;
    }

    public Task AgregarPrivilegiosRolesAsync(IEnumerable<RolPrivilegio> asignaciones, CancellationToken ct)
    {
        _db.RolPrivilegios.AddRange(asignaciones);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
