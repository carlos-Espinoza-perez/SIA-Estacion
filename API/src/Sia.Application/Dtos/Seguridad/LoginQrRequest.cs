using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Dtos.Seguridad;

public class LoginQrRequest
{
    [Required(ErrorMessage = "El código QR es obligatorio.")]
    public string CodigoQr { get; set; } = string.Empty;
}
