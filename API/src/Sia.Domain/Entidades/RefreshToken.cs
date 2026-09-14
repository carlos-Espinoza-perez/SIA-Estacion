namespace Sia.Domain.Entidades;

public class RefreshToken
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset FechaCreacion { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset FechaExpiracion { get; set; }
    public DateTimeOffset? FechaRevocacion { get; set; }

    public bool EstaVigente(DateTimeOffset ahora) => FechaRevocacion is null && FechaExpiracion > ahora;
}
