using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class EventoAcceso
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid? PersonaId { get; set; }
    public Guid EstacionId { get; set; }
    public DireccionAcceso Direccion { get; set; }
    public ModoValidacion ModoValidacion { get; set; }
    public ResultadoAcceso Resultado { get; set; }
    public string? MotivoDenegacion { get; set; }
    public string? FotoEvidenciaUrl { get; set; }
    public string CodigoEscaneado { get; set; } = string.Empty;
    public DateTimeOffset FechaHoraLocal { get; set; }
    public DateTimeOffset? FechaSincronizacion { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public Persona? Persona { get; set; }
    public Estacion Estacion { get; set; } = null!;
}
