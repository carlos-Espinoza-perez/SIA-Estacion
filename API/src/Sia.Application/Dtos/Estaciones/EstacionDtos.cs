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
    public bool EstaVinculada { get; set; }
    public string? MacAddress { get; set; }
    public string? CodigoVinculacion { get; set; }
    public DateTimeOffset? FechaVinculacion { get; set; }
    public DateTimeOffset? UltimaSincronizacion { get; set; }
}

public class CrearEstacionRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public Guid? EncargadoId { get; set; }
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
    public string? MacAddress { get; set; }
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
    public string? MacAddress { get; set; }
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
}

public class TipoItemEstacionRequest
{
    public List<Guid> TipoItemIds { get; set; } = [];
}

public class VincularEstacionRequest
{
    public string CodigoVinculacionOMac { get; set; } = string.Empty;
}

public class SolicitarPairingRequest
{
    public string MacAddress { get; set; } = string.Empty;
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
}

public class SolicitarPairingResponse
{
    public string CodigoVinculacion { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public int ExpiraEnMinutos { get; set; } = 15;
}

public class VerificarPairingRequest
{
    public string MacAddress { get; set; } = string.Empty;
    public string CodigoVinculacion { get; set; } = string.Empty;
}

public class VerificarPairingResponse
{
    public bool Vinculada { get; set; }
    public string? EstacionNombre { get; set; }
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
}
