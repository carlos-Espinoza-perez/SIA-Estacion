namespace Sia.Application.Dtos.Seguridad;

public class PrivilegioResponse
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Modulo { get; set; } = string.Empty;
    public bool Estado { get; set; }
}
