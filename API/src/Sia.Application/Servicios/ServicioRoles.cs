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
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ISeguridadRepository _repository;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioRoles(RoleManager<ApplicationRole> roleManager, ISeguridadRepository repository, IContextoEmpresa contextoEmpresa)
    {
        _roleManager = roleManager;
        _repository = repository;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<Result<List<RolResponse>>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<ApplicationRole> roles = _roleManager.Roles.ToList();
        var conteos = await _repository.ObtenerConteoUsuariosPorRolAsync(ct);
        var todosPrivilegios = await _repository.ObtenerTodosPrivilegiosRolesAsync(ct);

        var response = roles.Select(r => new RolResponse 
        { 
            Id = r.Id, 
            Nombre = r.Name ?? string.Empty,
            Descripcion = r.Descripcion,
            Activo = r.Activo,
            EsSistema = r.EsSistema,
            PersonasAsignadas = conteos.ContainsKey(r.Id) ? conteos[r.Id] : 0,
            Permisos = todosPrivilegios.Where(p => p.RoleId == r.Id).Select(p => p.Privilegio.Codigo).Distinct().ToList()
        }).ToList();
        
        return Result<List<RolResponse>>.Exitoso(response);
    }

    public async Task<Result<RolResponse>> CrearAsync(CrearRolRequest request, CancellationToken ct)
    {
        var role = new ApplicationRole(request.Nombre);
        IdentityResult resultado = await _roleManager.CreateAsync(role);

        if (!resultado.Succeeded)
            return Result<RolResponse>.Fallido("ROL_CREACION_FALLIDA", string.Join("; ", resultado.Errors.Select(e => e.Description)));

        return Result<RolResponse>.Exitoso(new RolResponse 
        { 
            Id = role.Id, 
            Nombre = role.Name ?? string.Empty,
            Descripcion = role.Descripcion,
            EsSistema = role.EsSistema,
            Activo = role.Activo,
            PersonasAsignadas = 0,
            Permisos = new List<string>()
        });
    }

    public async Task<Result<RolResponse>> ActualizarAsync(string id, CrearRolRequest request, CancellationToken ct)
    {
        ApplicationRole? role = await _roleManager.FindByIdAsync(id);
        if (role is null)
            throw new EntidadNoEncontradaException("Rol", id);

        role.Name = request.Nombre;
        role.Descripcion = request.Descripcion;
        role.Activo = request.Activo;
        
        await _roleManager.UpdateAsync(role);

        var conteos = await _repository.ObtenerConteoUsuariosPorRolAsync(ct);
        var privilegios = await _repository.ObtenerPrivilegiosRolAsync(id, ct);

        return Result<RolResponse>.Exitoso(new RolResponse 
        { 
            Id = role.Id, 
            Nombre = role.Name ?? string.Empty,
            Descripcion = role.Descripcion,
            EsSistema = role.EsSistema,
            Activo = role.Activo,
            PersonasAsignadas = conteos.ContainsKey(role.Id) ? conteos[role.Id] : 0,
            Permisos = privilegios.Select(p => p.Privilegio.Codigo).Distinct().ToList()
        });
    }

    public async Task<Result<bool>> EliminarAsync(string id, CancellationToken ct)
    {
        ApplicationRole? role = await _roleManager.FindByIdAsync(id);
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
        ApplicationRole? role = await _roleManager.FindByIdAsync(roleId);
        if (role is null)
            throw new EntidadNoEncontradaException("Rol", roleId);

        // Asegurar que los catálogos existan en la BD
        await _repository.AsegurarCatalogosDefaultAsync(ct);

        var privilegiosValidos = (await _repository.ObtenerPrivilegiosAsync(ct)).ToDictionary(p => p.Id);
        var nivelesValidos = (await _repository.ObtenerNivelesPermisoAsync(ct)).ToDictionary(n => n.Id);

        List<RolPrivilegio> existentes = await _repository.ObtenerPrivilegiosRolAsync(roleId, ct);
        await _repository.EliminarPrivilegiosRolAsync(existentes, ct);

        // Filtrar únicamente asignaciones que tengan PrivilegioId y NivelPermisoId válidos en BD y sin duplicados
        var nuevas = request.Asignaciones
            .Where(a => privilegiosValidos.ContainsKey(a.PrivilegioId) && nivelesValidos.ContainsKey(a.NivelPermisoId))
            .DistinctBy(a => new { a.PrivilegioId, a.NivelPermisoId })
            .Select(a => new RolPrivilegio
            {
                Id = Guid.NewGuid(),
                RoleId = roleId,
                PrivilegioId = a.PrivilegioId,
                NivelPermisoId = a.NivelPermisoId,
                Estado = true,
                FechaAsignacion = DateTimeOffset.UtcNow
            })
            .ToList();

        if (nuevas.Any())
        {
            await _repository.AgregarPrivilegiosRolesAsync(nuevas, ct);
        }

        await _repository.SaveChangesAsync(ct);
        
        return Result<bool>.Exitoso(true);
    }
}
