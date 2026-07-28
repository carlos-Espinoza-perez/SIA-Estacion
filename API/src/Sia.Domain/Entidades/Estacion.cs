namespace Sia.Domain.Entidades;

public class Estacion
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecretHash { get; set; } = string.Empty;
    public bool RequiereIdentificacion { get; set; }
    public bool RequiereAprobacion { get; set; }
    public bool Estado { get; set; } = true;
    public DateTimeOffset? UltimaSincronizacion { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public ICollection<EstacionTipoItem> TiposItemHabilitados { get; set; } = [];
    public ICollection<EventoAcceso> EventosAcceso { get; set; } = [];
}
