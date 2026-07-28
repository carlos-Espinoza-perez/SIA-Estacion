namespace Sia.Application.Dtos.Seguridad;

public class RolResponse
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public Guid? EmpresaId { get; set; }
}
