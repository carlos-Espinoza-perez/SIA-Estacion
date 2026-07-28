using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Configuracion;

public class QrOpciones
{
    public const string Seccion = "Qr";

    [Required] public string PatronCodigoInstitucional { get; set; } = string.Empty;
}
