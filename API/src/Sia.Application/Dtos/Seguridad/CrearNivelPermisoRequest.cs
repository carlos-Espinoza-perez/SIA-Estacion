namespace Sia.Application.Dtos.Seguridad;

public class CrearNivelPermisoRequest
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int Orden { get; set; }
}
