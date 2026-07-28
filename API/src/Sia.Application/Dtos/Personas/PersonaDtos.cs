namespace Sia.Application.Dtos.Personas;

public class PersonaResponse
{
    public Guid Id { get; set; }
    public string CodigoEstudiantil { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string TipoPersona { get; set; } = string.Empty;
    public bool Estado { get; set; }
    public DateTimeOffset FechaRegistro { get; set; }
    public bool TieneFotoReferencia { get; set; }
}

public class PersonaDetalleResponse : PersonaResponse
{
    public string? UserId { get; set; }
    public FotoReferenciaResponse? FotoReferencia { get; set; }
}

public class FotoReferenciaResponse
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public DateTimeOffset FechaCarga { get; set; }
}

public class CrearPersonaRequest
{
    public string CodigoEstudiantil { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string TipoPersona { get; set; } = string.Empty;
}

public class ActualizarPersonaRequest
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string TipoPersona { get; set; } = string.Empty;
}
