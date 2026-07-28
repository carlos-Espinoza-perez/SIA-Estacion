using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class Persona
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public string CodigoEstudiantil { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public TipoPersona TipoPersona { get; set; }
    public string? UserId { get; set; }
    public bool Estado { get; set; } = true;
    public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;

    public Empresa Empresa { get; set; } = null!;
    public ICollection<FotoReferencia> FotosReferencia { get; set; } = [];
    public ICollection<EventoAcceso> EventosAcceso { get; set; } = [];
    public ICollection<OperacionItem> Operaciones { get; set; } = [];
}
