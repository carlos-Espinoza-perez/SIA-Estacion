namespace Sia.Application.Dtos.Comunes;

public class ConsultaPaginada
{
    public int Pagina { get; set; } = 1;
    public int TamanoPagina { get; set; } = 20;
    public string? Busqueda { get; set; }
    public string? OrdenarPor { get; set; }
    public bool Descendente { get; set; }
}
