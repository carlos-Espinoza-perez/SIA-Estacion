using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class OperacionItem
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public string Folio { get; set; } = string.Empty;
    public Guid ItemEscaneadoId { get; set; }
    public Guid PersonaId { get; set; }
    public Guid EstacionId { get; set; }
    public TipoOperacionItem TipoOperacion { get; set; }
    public EstadoOperacionItem EstadoActual { get; set; }
    public string? Observaciones { get; set; }
    public bool Estado { get; set; } = true;
    public DateTimeOffset FechaSolicitud { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? FechaCompromisoDevolucion { get; set; }
    public DateTimeOffset? FechaDevolucion { get; set; }
    public Guid? AprobadoPorPersonaId { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public Empresa Empresa { get; set; } = null!;
    public Item ItemEscaneado { get; set; } = null!;
    public Persona Persona { get; set; } = null!;
    public Estacion Estacion { get; set; } = null!;
    public Persona? AprobadoPorPersona { get; set; }
    public ICollection<OperacionItemDetalle> Detalles { get; set; } = [];
    public ICollection<OperacionMovimiento> Movimientos { get; set; } = [];
}
