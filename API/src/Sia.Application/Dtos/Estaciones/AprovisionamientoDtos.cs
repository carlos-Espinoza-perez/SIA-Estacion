namespace Sia.Application.Dtos.Estaciones;

public class ConfiguracionEstacionProvisionadaResponse
{
    public Guid EstacionId { get; set; }
    public string EstacionNombre { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
}

public class EstacionConfiguracionResponse
{
    public Guid EstacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
    public bool Estado { get; set; }
}

public class HeartbeatEstacionRequest
{
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
}

