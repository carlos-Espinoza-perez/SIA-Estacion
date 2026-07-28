using Sia.Domain.Enums;

namespace Sia.Domain.Entidades;

public class OperacionMovimiento
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public Guid OperacionItemId { get; set; }
    public EstadoOperacionItem EstadoAnterior { get; set; }
    public EstadoOperacionItem EstadoNuevo { get; set; }
    public Guid? RegistradoPorPersonaId { get; set; }
    public Guid? EstacionId { get; set; }
    public DateTimeOffset FechaHora { get; set; } = DateTimeOffset.UtcNow;
    public string? Observacion { get; set; }

    public Empresa Empresa { get; set; } = null!;
    public OperacionItem OperacionItem { get; set; } = null!;
    public Persona? RegistradoPorPersona { get; set; }
    public Estacion? Estacion { get; set; }
}
