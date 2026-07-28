using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Configuracion;

public class AlmacenamientoOpciones
{
    public const string Seccion = "Almacenamiento";

    [Required] public string RutaBase { get; set; } = string.Empty;
    public string Contenedor { get; set; } = "fotos";
    public int UrlFirmadaMinutos { get; set; } = 30;
}
