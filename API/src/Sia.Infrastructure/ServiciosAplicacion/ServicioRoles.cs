using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Seguridad;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioRoles
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly SiaDbContext _db;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioRoles(RoleManager<IdentityRole> roleManager, SiaDbContext db, IContextoEmpresa contextoEmpresa)
    {
        _roleManager = roleManager;
        _db = db;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<List<RolResponse>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<IdentityRole> roles = await _roleManager.Roles.ToListAsync(ct);
        return roles.Select(r => new RolResponse { Id = r.Id, Nombre = r.Name ?? string.Empty }).ToList();
    }

    public async Task<RolResponse> CrearAsync(CrearRolRequest request, CancellationToken ct)
    {
        var role = new IdentityRole(request.Nombre);
        IdentityResult resultado = await _roleManager.CreateAsync(role);

        if (!resultado.Succeeded)
            throw new ReglaNegocioException("ROL_CREACION_FALLIDA",
                string.Join("; ", resultado.Errors.Select(e => e.Description)));

        return new RolResponse { Id = role.Id, Nombre = role.Name ?? string.Empty };
    }

    public async Task<RolResponse> ActualizarAsync(string id, CrearRolRequest request, CancellationToken ct)
    {
        IdentityRole? role = await _roleManager.FindByIdAsync(id)
            ?? throw new EntidadNoEncontradaException("Rol", id);

        role.Name = request.Nombre;
        await _roleManager.UpdateAsync(role);

        return new RolResponse { Id = role.Id, Nombre = role.Name ?? string.Empty };
    }

    public async Task EliminarAsync(string id, CancellationToken ct)
    {
        IdentityRole? role = await _roleManager.FindByIdAsync(id)
            ?? throw new EntidadNoEncontradaException("Rol", id);

        await _roleManager.DeleteAsync(role);
    }

    public async Task<List<RolPrivilegioResponse>> ObtenerPrivilegiosRolAsync(string roleId, CancellationToken ct)
    {
        List<RolPrivilegio> asignaciones = await _db.RolPrivilegios
            .IgnoreQueryFilters()
            .Include(rp => rp.Privilegio)
            .Include(rp => rp.NivelPermiso)
            .Where(rp => rp.RoleId == roleId && rp.Estado)
            .ToListAsync(ct);

        return asignaciones.Select(rp => new RolPrivilegioResponse
        {
            Id = rp.Id,
            PrivilegioId = rp.PrivilegioId,
            PrivilegioCodigo = rp.Privilegio.Codigo,
            PrivilegioNombre = rp.Privilegio.Nombre,
            NivelPermisoId = rp.NivelPermisoId,
            NivelPermisoCodigo = rp.NivelPermiso.Codigo,
            NivelPermisoNombre = rp.NivelPermiso.Nombre
        }).ToList();
    }

    public async Task ReemplazarMatrizAsync(string roleId, MatrizPrivilegiosRequest request, CancellationToken ct)
    {
        IdentityRole? role = await _roleManager.FindByIdAsync(roleId)
            ?? throw new EntidadNoEncontradaException("Rol", roleId);

        List<RolPrivilegio> existentes = await _db.RolPrivilegios
            .IgnoreQueryFilters()
            .Where(rp => rp.RoleId == roleId)
            .ToListAsync(ct);

        _db.RolPrivilegios.RemoveRange(existentes);

        List<RolPrivilegio> nuevas = request.Asignaciones.Select(a => new RolPrivilegio
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            PrivilegioId = a.PrivilegioId,
            NivelPermisoId = a.NivelPermisoId,
            FechaAsignacion = DateTimeOffset.UtcNow
        }).ToList();

        _db.RolPrivilegios.AddRange(nuevas);
        await _db.SaveChangesAsync(ct);
    }
}
