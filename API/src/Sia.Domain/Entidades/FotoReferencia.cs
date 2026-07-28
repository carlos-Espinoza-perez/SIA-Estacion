namespace Sia.Domain.Entidades;

public class FotoReferencia
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid PersonaId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string HashContenido { get; set; } = string.Empty;
    public bool Estado { get; set; } = true;
    public DateTimeOffset FechaCarga { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? FechaEliminacion { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public Persona Persona { get; set; } = null!;
}
