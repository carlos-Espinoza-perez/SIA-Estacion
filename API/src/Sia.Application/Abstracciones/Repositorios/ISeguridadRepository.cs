using Sia.Domain.Entidades;

namespace Sia.Application.Abstracciones.Repositorios;

public interface ISeguridadRepository
{
    // Privilegios
    Task<List<Privilegio>> ObtenerPrivilegiosAsync(CancellationToken ct);
    Task<Privilegio?> ObtenerPrivilegioPorIdAsync(Guid id, CancellationToken ct);
    Task AgregarPrivilegioAsync(Privilegio privilegio, CancellationToken ct);

    // Niveles de Permiso
    Task<List<NivelPermiso>> ObtenerNivelesPermisoAsync(CancellationToken ct);
    Task<NivelPermiso?> ObtenerNivelPermisoPorIdAsync(Guid id, CancellationToken ct);
    Task AgregarNivelPermisoAsync(NivelPermiso nivelPermiso, CancellationToken ct);

    // Roles y Privilegios
    Task<List<RolPrivilegio>> ObtenerPrivilegiosRolAsync(string roleId, CancellationToken ct);
    Task<List<RolPrivilegio>> ObtenerPrivilegiosRolesAsync(IEnumerable<string> roleIds, CancellationToken ct);
    Task EliminarPrivilegiosRolAsync(IEnumerable<RolPrivilegio> asignaciones, CancellationToken ct);
    Task AgregarPrivilegiosRolesAsync(IEnumerable<RolPrivilegio> asignaciones, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}
