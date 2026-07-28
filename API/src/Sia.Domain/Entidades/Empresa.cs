namespace Sia.Domain.Entidades;

public class Empresa
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public bool Estado { get; set; } = true;
    public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Persona> Personas { get; set; } = [];
    public ICollection<TipoItem> TiposItem { get; set; } = [];
    public ICollection<Item> Items { get; set; } = [];
    public ICollection<Estacion> Estaciones { get; set; } = [];
}
