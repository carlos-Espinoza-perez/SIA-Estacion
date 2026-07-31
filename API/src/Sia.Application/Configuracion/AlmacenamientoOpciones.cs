using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Configuracion;

public class AlmacenamientoOpciones
{
    public const string Seccion = "Almacenamiento";

    [Required] public string ConnectionString { get; set; } = string.Empty;
    public string Contenedor { get; set; } = "filepersonas";
    public int UrlFirmadaMinutos { get; set; } = 30;
}
