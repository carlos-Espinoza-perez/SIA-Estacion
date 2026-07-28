namespace Sia.Application.Dtos.Seguridad;

public class CrearUsuarioRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid? PersonaId { get; set; }
    public List<string> Roles { get; set; } = [];
}
