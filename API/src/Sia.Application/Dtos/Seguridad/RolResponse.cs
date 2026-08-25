namespace Sia.Application.Dtos.Seguridad;

public class RolResponse
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool EsSistema { get; set; }
    public bool Activo { get; set; }
    public int PersonasAsignadas { get; set; }
    public List<string> Permisos { get; set; } = new();
    public Guid? EmpresaId { get; set; }
}
