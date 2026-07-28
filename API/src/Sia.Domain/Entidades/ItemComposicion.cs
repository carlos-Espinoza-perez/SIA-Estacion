namespace Sia.Domain.Entidades;

public class ItemComposicion
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid ItemAgrupadorId { get; set; }
    public Guid ItemComponenteId { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public Item ItemAgrupador { get; set; } = null!;
    public Item ItemComponente { get; set; } = null!;
}
