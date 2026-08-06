namespace Sia.Domain.Entidades;

public class AuditoriaCambio
{
    public Guid Id { get; set; }
    public Guid EmpresaId { get; set; }
    public string Entidad { get; set; } = string.Empty;
    public Guid EntidadId { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Origen { get; set; } = "Panel";
    public Guid? EstacionId { get; set; }
    public string? ValoresAnteriores { get; set; }
    public string? ValoresNuevos { get; set; }
    public string? UserId { get; set; }
    public DateTimeOffset FechaHora { get; set; } = DateTimeOffset.UtcNow;

    public Empresa Empresa { get; set; } = null!;
}
