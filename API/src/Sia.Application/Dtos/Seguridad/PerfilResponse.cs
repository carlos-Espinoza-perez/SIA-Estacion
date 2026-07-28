namespace Sia.Application.Dtos.Seguridad;

public class PerfilResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid EmpresaId { get; set; }
    public Guid PersonaId { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
    public List<PrivilegioEfectivoDto> Privilegios { get; set; } = [];
}

public class PrivilegioEfectivoDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public List<string> Niveles { get; set; } = [];
}
