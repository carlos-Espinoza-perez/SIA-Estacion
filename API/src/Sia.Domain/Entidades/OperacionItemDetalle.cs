using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class OperacionItemDetalle
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid OperacionItemId { get; set; }
    public Guid ItemId { get; set; }
    public CondicionDevolucion? CondicionDevolucion { get; set; }
    public DateTimeOffset? FechaDevolucion { get; set; }
    public string? Observacion { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public OperacionItem OperacionItem { get; set; } = null!;
    public Item Item { get; set; } = null!;
}
