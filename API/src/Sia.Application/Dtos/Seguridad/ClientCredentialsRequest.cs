namespace Sia.Application.Dtos.Seguridad;

public class ClientCredentialsRequest
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}
