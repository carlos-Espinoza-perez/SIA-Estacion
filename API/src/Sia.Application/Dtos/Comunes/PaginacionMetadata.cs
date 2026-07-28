namespace Sia.Application.Dtos.Comunes;

public class PaginacionMetadata
{
    public int PaginaActual { get; set; }
    public int TamanoPagina { get; set; }
    public int TotalRegistros { get; set; }
    public int TotalPaginas { get; set; }
    public bool TieneSiguiente => PaginaActual < TotalPaginas;
    public bool TieneAnterior => PaginaActual > 1;
}
