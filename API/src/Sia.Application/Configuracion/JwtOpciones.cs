using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Configuracion;

public class JwtOpciones
{
    public const string Seccion = "Jwt";

    [Required] public string Issuer { get; set; } = string.Empty;
    [Required] public string Audience { get; set; } = string.Empty;
    [Required] public string SigningKey { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 30;
    public int RefreshTokenDays { get; set; } = 7;
    public int EstacionTokenMinutes { get; set; } = 60;
}
