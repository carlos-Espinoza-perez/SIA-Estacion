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
        var privs = await _db.Privilegios
            .IgnoreQueryFilters()
            .Where(p => p.Estado)
            .OrderBy(p => p.Modulo).ThenBy(p => p.Nombre)
            .ToListAsync(ct);

        if (!privs.Any())
        {
            await AsegurarCatalogosDefaultAsync(ct);
            privs = await _db.Privilegios
                .IgnoreQueryFilters()
                .Where(p => p.Estado)
                .OrderBy(p => p.Modulo).ThenBy(p => p.Nombre)
                .ToListAsync(ct);
        }

        return privs;
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
        var niveles = await _db.NivelesPermiso
            .IgnoreQueryFilters()
            .Where(n => n.Estado)
            .OrderBy(n => n.Orden)
            .ToListAsync(ct);

        if (!niveles.Any())
        {
            await AsegurarCatalogosDefaultAsync(ct);
            niveles = await _db.NivelesPermiso
                .IgnoreQueryFilters()
                .Where(n => n.Estado)
                .OrderBy(n => n.Orden)
                .ToListAsync(ct);
        }

        return niveles;
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

    public async Task AgregarPrivilegiosRolesAsync(IEnumerable<RolPrivilegio> asignaciones, CancellationToken ct)
    {
        await _db.RolPrivilegios.AddRangeAsync(asignaciones, ct);
    }

    public async Task<Dictionary<string, int>> ObtenerConteoUsuariosPorRolAsync(CancellationToken ct)
    {
        return await _db.UserRoles
            .GroupBy(ur => ur.RoleId)
            .Select(g => new { RoleId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RoleId, x => x.Count, ct);
    }

    public async Task<List<RolPrivilegio>> ObtenerTodosPrivilegiosRolesAsync(CancellationToken ct)
    {
        return await _db.RolPrivilegios
            .Include(rp => rp.Privilegio)
            .ToListAsync(ct);
    }

    public async Task AsegurarCatalogosDefaultAsync(CancellationToken ct)
    {
        bool requiereGuardar = false;

        // Niveles de Permiso
        var nivelesDefault = new List<NivelPermiso>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111101"), Codigo = "C", Nombre = "Crear", Orden = 1, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111102"), Codigo = "L", Nombre = "Lectura", Orden = 2, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111103"), Codigo = "A", Nombre = "Actualizar", Orden = 3, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111104"), Codigo = "B", Nombre = "Borrar", Orden = 4, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111105"), Codigo = "E", Nombre = "Escritura", Orden = 5, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111106"), Codigo = "T", Nombre = "Total", Orden = 6, Estado = true },
        };

        foreach (var nd in nivelesDefault)
        {
            var existente = await _db.NivelesPermiso.FirstOrDefaultAsync(n => n.Id == nd.Id || n.Codigo == nd.Codigo, ct);
            if (existente == null)
            {
                _db.NivelesPermiso.Add(nd);
                requiereGuardar = true;
            }
        }

        // Privilegios del Sistema
        var privilegiosDefault = new List<Privilegio>
        {
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222201"), Codigo = "ACC", Nombre = "Control de Accesos", Modulo = "Accesos", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222202"), Codigo = "OPE", Nombre = "Operaciones y Préstamos", Modulo = "Operaciones", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222203"), Codigo = "PER", Nombre = "Gestión de Personas", Modulo = "Personas", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222204"), Codigo = "ITM", Nombre = "Gestión de Ítems e Inventario", Modulo = "Inventario", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222205"), Codigo = "TIP", Nombre = "Tipos de Ítems y Categorías", Modulo = "Catálogos", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222206"), Codigo = "EST", Nombre = "Configuración de Estaciones", Modulo = "Estaciones", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222207"), Codigo = "ROL", Nombre = "Gestión de Roles y Permisos", Modulo = "Seguridad", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222208"), Codigo = "USU", Nombre = "Gestión de Usuarios", Modulo = "Seguridad", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222209"), Codigo = "AUD", Nombre = "Auditoría y Bitácora", Modulo = "Auditoría", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222210"), Codigo = "REP", Nombre = "Reportes y Estadísticas", Modulo = "Reportes", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222211"), Codigo = "EMP", Nombre = "Configuración de Empresas", Modulo = "Configuración", Estado = true },
        };

        foreach (var pd in privilegiosDefault)
        {
            var existente = await _db.Privilegios.FirstOrDefaultAsync(p => p.Id == pd.Id || p.Codigo == pd.Codigo, ct);
            if (existente == null)
            {
                _db.Privilegios.Add(pd);
                requiereGuardar = true;
            }
        }

        if (requiereGuardar)
        {
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
