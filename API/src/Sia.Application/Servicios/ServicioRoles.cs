using Microsoft.AspNetCore.Identity;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioRoles
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ISeguridadRepository _repository;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioRoles(RoleManager<IdentityRole> roleManager, ISeguridadRepository repository, IContextoEmpresa contextoEmpresa)
    {
        _roleManager = roleManager;
        _repository = repository;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<Result<List<RolResponse>>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<IdentityRole> roles = _roleManager.Roles.ToList();
        var response = roles.Select(r => new RolResponse { Id = r.Id, Nombre = r.Name ?? string.Empty }).ToList();
        return Result<List<RolResponse>>.Exitoso(response);
    }

    public async Task<Result<RolResponse>> CrearAsync(CrearRolRequest request, CancellationToken ct)
    {
        var role = new IdentityRole(request.Nombre);
        IdentityResult resultado = await _roleManager.CreateAsync(role);

        if (!resultado.Succeeded)
            return Result<RolResponse>.Fallido("ROL_CREACION_FALLIDA", string.Join("; ", resultado.Errors.Select(e => e.Description)));

        return Result<RolResponse>.Exitoso(new RolResponse { Id = role.Id, Nombre = role.Name ?? string.Empty });
    }

    public async Task<Result<RolResponse>> ActualizarAsync(string id, CrearRolRequest request, CancellationToken ct)
    {
        IdentityRole? role = await _roleManager.FindByIdAsync(id);
        if (role is null)
            throw new EntidadNoEncontradaException("Rol", id);

        role.Name = request.Nombre;
        await _roleManager.UpdateAsync(role);

        return Result<RolResponse>.Exitoso(new RolResponse { Id = role.Id, Nombre = role.Name ?? string.Empty });
    }

    public async Task<Result<bool>> EliminarAsync(string id, CancellationToken ct)
    {
        IdentityRole? role = await _roleManager.FindByIdAsync(id);
        if (role is null)
            throw new EntidadNoEncontradaException("Rol", id);

        await _roleManager.DeleteAsync(role);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<List<RolPrivilegioResponse>>> ObtenerPrivilegiosRolAsync(string roleId, CancellationToken ct)
    {
        List<RolPrivilegio> asignaciones = await _repository.ObtenerPrivilegiosRolAsync(roleId, ct);

        var response = asignaciones.Select(rp => new RolPrivilegioResponse
        {
            Id = rp.Id,
            PrivilegioId = rp.PrivilegioId,
            PrivilegioCodigo = rp.Privilegio.Codigo,
            PrivilegioNombre = rp.Privilegio.Nombre,
            NivelPermisoId = rp.NivelPermisoId,
            NivelPermisoCodigo = rp.NivelPermiso.Codigo,
            NivelPermisoNombre = rp.NivelPermiso.Nombre
        }).ToList();

        return Result<List<RolPrivilegioResponse>>.Exitoso(response);
    }

    public async Task<Result<bool>> ReemplazarMatrizAsync(string roleId, MatrizPrivilegiosRequest request, CancellationToken ct)
    {
        IdentityRole? role = await _roleManager.FindByIdAsync(roleId);
        if (role is null)
            throw new EntidadNoEncontradaException("Rol", roleId);

        List<RolPrivilegio> existentes = await _repository.ObtenerPrivilegiosRolAsync(roleId, ct);

        await _repository.EliminarPrivilegiosRolAsync(existentes, ct);

        List<RolPrivilegio> nuevas = request.Asignaciones.Select(a => new RolPrivilegio
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            PrivilegioId = a.PrivilegioId,
            NivelPermisoId = a.NivelPermisoId,
            FechaAsignacion = DateTimeOffset.UtcNow
        }).ToList();

        await _repository.AgregarPrivilegiosRolesAsync(nuevas, ct);
        await _repository.SaveChangesAsync(ct);
        
        return Result<bool>.Exitoso(true);
    }
}
