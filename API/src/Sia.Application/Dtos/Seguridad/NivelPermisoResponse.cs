namespace Sia.Application.Dtos.Seguridad;

public class NivelPermisoResponse
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int Orden { get; set; }
    public bool Estado { get; set; }
}
