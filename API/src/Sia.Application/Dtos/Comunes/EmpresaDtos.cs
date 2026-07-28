namespace Sia.Application.Dtos.Comunes;

public class EmpresaResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public bool Estado { get; set; }
    public DateTimeOffset FechaRegistro { get; set; }
}

public class CrearEmpresaRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
}

public class ActualizarEmpresaRequest
{
    public string Nombre { get; set; } = string.Empty;
}
