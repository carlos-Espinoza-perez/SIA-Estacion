using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class Item
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid TipoItemId { get; set; }
    public string CodigoQr { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool EsAgrupador { get; set; }
    public EstadoItem EstadoActual { get; set; } = EstadoItem.Disponible;
    public bool Estado { get; set; } = true;
    public byte[] RowVersion { get; set; } = [];

    public Empresa Empresa { get; set; } = null!;
    public TipoItem TipoItem { get; set; } = null!;
    public ICollection<ItemAtributoValor> AtributoValores { get; set; } = [];
    public ICollection<ItemComposicion> ComponentesDe { get; set; } = [];
    public ICollection<ItemComposicion> AgrupadorDe { get; set; } = [];
}
