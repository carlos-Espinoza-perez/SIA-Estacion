namespace Sia.Domain.Entidades;

public class ItemAtributoValor
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid ItemId { get; set; }
    public Guid AtributoDefinicionId { get; set; }
    public string Valor { get; set; } = string.Empty;

    public Empresa Empresa { get; set; } = null!;
    public Item Item { get; set; } = null!;
    public AtributoDefinicion AtributoDefinicion { get; set; } = null!;
}
