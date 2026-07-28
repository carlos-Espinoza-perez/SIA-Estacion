namespace Sia.Application.Dtos.Items;

public class TipoItemResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool PermiteAgrupacion { get; set; }
    public bool Estado { get; set; }
}

public class CrearTipoItemRequest
{
    public string Nombre { get; set; } = string.Empty;
    public bool PermiteAgrupacion { get; set; }
}

public class AtributoDefinicionResponse
{
    public Guid Id { get; set; }
    public string Clave { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;
    public bool Requerido { get; set; }
    public int Orden { get; set; }
    public bool Estado { get; set; }
}

public class CrearAtributoRequest
{
    public string Clave { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;
    public bool Requerido { get; set; }
    public int Orden { get; set; }
}

public class ItemResponse
{
    public Guid Id { get; set; }
    public Guid TipoItemId { get; set; }
    public string TipoItemNombre { get; set; } = string.Empty;
    public string CodigoQr { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool EsAgrupador { get; set; }
    public string EstadoActual { get; set; } = string.Empty;
    public bool Estado { get; set; }
}

public class ItemDetalleResponse : ItemResponse
{
    public List<AtributoValorResponse> Atributos { get; set; } = [];
    public List<ComponenteResponse> Componentes { get; set; } = [];
}

public class AtributoValorResponse
{
    public Guid AtributoDefinicionId { get; set; }
    public string Clave { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
}

public class ComponenteResponse
{
    public Guid ItemId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string CodigoQr { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
}

public class CrearItemRequest
{
    public Guid TipoItemId { get; set; }
    public string CodigoQr { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool EsAgrupador { get; set; }
    public List<AtributoValorRequest> Atributos { get; set; } = [];
}

public class AtributoValorRequest
{
    public Guid AtributoDefinicionId { get; set; }
    public string Valor { get; set; } = string.Empty;
}

public class ActualizarItemRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
    public List<AtributoValorRequest> Atributos { get; set; } = [];
}

public class AgregarComponenteRequest
{
    public Guid ItemComponenteId { get; set; }
}
