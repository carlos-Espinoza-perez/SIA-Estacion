namespace Sia.Domain.Entidades;

public class EstacionTipoItem
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid EstacionId { get; set; }
    public Guid TipoItemId { get; set; }
    public bool Estado { get; set; } = true;

    public Empresa Empresa { get; set; } = null!;
    public Estacion Estacion { get; set; } = null!;
    public TipoItem TipoItem { get; set; } = null!;
}
