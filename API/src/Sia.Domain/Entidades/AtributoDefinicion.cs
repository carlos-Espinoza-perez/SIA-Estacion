using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class AtributoDefinicion
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid TipoItemId { get; set; }
    public string Clave { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;
    public TipoDatoAtributo TipoDato { get; set; }
    public bool Requerido { get; set; }
    public int Orden { get; set; }
    public bool Estado { get; set; } = true;

    public Empresa Empresa { get; set; } = null!;
    public TipoItem TipoItem { get; set; } = null!;
    public ICollection<ItemAtributoValor> Valores { get; set; } = [];
}
