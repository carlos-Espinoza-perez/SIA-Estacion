namespace Sia.Application.Dtos.Acceso;

public class ValidarAccesoRequest
{
    public string CodigoEscaneado { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public DateTimeOffset FechaHoraLocal { get; set; }
    public byte[]? Imagen { get; set; }
}

public class ValidarAccesoResponse
{
    public string Resultado { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public int DuracionMs { get; set; } = 3000;
}

public class LoteEventosRequest
{
    public List<EventoOfflineDto> Eventos { get; set; } = [];
}

public class EventoOfflineDto
{
    public string IdEvento { get; set; } = string.Empty;
    public string CodigoEscaneado { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
    public DateTimeOffset FechaHoraLocal { get; set; }
}

public class ConfiguracionEstacionResponse
{
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
    public List<string> TiposItemHabilitados { get; set; } = [];
}

public class SincronizacionCodigosResponse
{
    public List<string> Codigos { get; set; } = [];
    public DateTimeOffset Timestamp { get; set; }
}

public class EscanearItemResponse
{
    public Guid ItemId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string TipoItem { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
    public bool EsAgrupador { get; set; }
    public List<string> Componentes { get; set; } = [];
    public bool Disponible { get; set; }
}

public class CrearOperacionEstacionRequest
{
    public Guid ItemId { get; set; }
    public string CodigoPersona { get; set; } = string.Empty;
}
