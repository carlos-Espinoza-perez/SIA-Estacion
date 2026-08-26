namespace Sia.Domain.Entidades;

public class Estacion
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public Guid? EncargadoId { get; set; }
    public string? FirmwareVersion { get; set; }
    public string? DireccionIp { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecretHash { get; set; } = string.Empty;
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
    public bool Estado { get; set; } = true;
    public bool EstaVinculada { get; set; } = false;
    public string? MacAddress { get; set; }
    public string? CodigoVinculacion { get; set; }
    public DateTimeOffset? FechaVinculacion { get; set; }
    public DateTimeOffset? UltimaSincronizacion { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public Persona? Encargado { get; set; }
    public ICollection<EstacionTipoItem> TiposItemHabilitados { get; set; } = [];
    public ICollection<EventoAcceso> EventosAcceso { get; set; } = [];
}
