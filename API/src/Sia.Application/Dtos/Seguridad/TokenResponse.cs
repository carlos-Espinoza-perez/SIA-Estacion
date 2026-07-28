namespace Sia.Application.Dtos.Seguridad;

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresInMinutes { get; set; }
}
