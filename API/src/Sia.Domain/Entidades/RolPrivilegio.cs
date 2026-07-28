namespace Sia.Domain.Entidades;

public class RolPrivilegio
{
    public Guid Id { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public Guid PrivilegioId { get; set; }
    public Guid NivelPermisoId { get; set; }
    public bool Estado { get; set; } = true;
    public DateTimeOffset FechaAsignacion { get; set; } = DateTimeOffset.UtcNow;

    public Privilegio Privilegio { get; set; } = null!;
    public NivelPermiso NivelPermiso { get; set; } = null!;
}
