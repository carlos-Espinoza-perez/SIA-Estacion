namespace Sia.Domain.Entidades;

public class NivelPermiso
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int Orden { get; set; }
    public bool Estado { get; set; } = true;

    public ICollection<RolPrivilegio> RolPrivilegios { get; set; } = [];
}
