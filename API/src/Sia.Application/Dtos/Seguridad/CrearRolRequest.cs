namespace Sia.Application.Dtos.Seguridad;

public class CrearRolRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; } = true;
    public bool EsSistema { get; set; } = false;
}
