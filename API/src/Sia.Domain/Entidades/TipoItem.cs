namespace Sia.Domain.Entidades;

public class TipoItem
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool PermiteAgrupacion { get; set; }
    public bool Estado { get; set; } = true;

    public Empresa Empresa { get; set; } = null!;
    public ICollection<AtributoDefinicion> Atributos { get; set; } = [];
    public ICollection<Item> Items { get; set; } = [];
    public ICollection<EstacionTipoItem> EstacionesTipoItem { get; set; } = [];
}
