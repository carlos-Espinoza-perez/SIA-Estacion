namespace Sia.Application.Dtos.Seguridad;

public class CrearPrivilegioRequest
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Modulo { get; set; } = string.Empty;
}
