namespace Sia.Application.Dtos.Seguridad;

public class UsuarioResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid? PersonaId { get; set; }
    public string? NombreCompleto { get; set; }
    public List<string> Roles { get; set; } = [];
}
