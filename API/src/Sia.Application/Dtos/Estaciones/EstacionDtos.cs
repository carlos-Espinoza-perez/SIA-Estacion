namespace Sia.Application.Dtos.Estaciones;

public class EstacionResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public Guid? EncargadoId { get; set; }
    public string? EncargadoNombre { get; set; }
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
    public bool Estado { get; set; }
    public DateTimeOffset? UltimaSincronizacion { get; set; }
}

public class CrearEstacionRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public Guid? EncargadoId { get; set; }
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
}

public class CrearEstacionResponse : EstacionResponse
{
    public string ClientSecret { get; set; } = string.Empty;
}

public class ActualizarEstacionRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public Guid? EncargadoId { get; set; }
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
}

public class TipoItemEstacionRequest
{
    public List<Guid> TipoItemIds { get; set; } = [];
}
