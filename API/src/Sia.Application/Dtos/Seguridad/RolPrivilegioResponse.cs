namespace Sia.Application.Dtos.Seguridad;

public class RolPrivilegioResponse
{
    public Guid Id { get; set; }
    public Guid PrivilegioId { get; set; }
    public string PrivilegioCodigo { get; set; } = string.Empty;
    public string PrivilegioNombre { get; set; } = string.Empty;
    public Guid NivelPermisoId { get; set; }
    public string NivelPermisoCodigo { get; set; } = string.Empty;
    public string NivelPermisoNombre { get; set; } = string.Empty;
}
