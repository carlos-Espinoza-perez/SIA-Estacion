namespace Sia.Application.Dtos.Reportes;

public class PresenciaResponse
{
    public Guid PersonaId { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string UltimoEvento { get; set; } = string.Empty;
    public DateTimeOffset FechaHora { get; set; }
    public string Estacion { get; set; } = string.Empty;
}

public class EventoReporteResponse
{
    public Guid Id { get; set; }
    public string? PersonaNombre { get; set; }
    public string EstacionNombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string ModoValidacion { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
    public string? MotivoDenegacion { get; set; }
    public string? FotoEvidenciaUrl { get; set; }
    public DateTimeOffset FechaHoraLocal { get; set; }
}

public class TrazabilidadItemResponse
{
    public Guid ItemId { get; set; }
    public string ItemNombre { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
    public List<OperacionHistorialDto> Historial { get; set; } = [];
}

public class OperacionHistorialDto
{
    public Guid OperacionId { get; set; }
    public string TipoOperacion { get; set; } = string.Empty;
    public string PersonaNombre { get; set; } = string.Empty;
    public string EstadoFinal { get; set; } = string.Empty;
    public DateTimeOffset FechaSolicitud { get; set; }
    public DateTimeOffset? FechaDevolucion { get; set; }
    public string? CondicionDevolucion { get; set; }
}

public class PrestamoVencidoResponse
{
    public Guid OperacionId { get; set; }
    public string ItemNombre { get; set; } = string.Empty;
    public string PersonaNombre { get; set; } = string.Empty;
    public DateTimeOffset FechaCompromiso { get; set; }
    public int DiasVencido { get; set; }
}

public class AuditoriaResponse
{
    public Guid Id { get; set; }
    public string Entidad { get; set; } = string.Empty;
    public Guid EntidadId { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Origen { get; set; } = "Panel";
    public Guid? EstacionId { get; set; }
    public string? UserId { get; set; }
    public string? NombreUsuario { get; set; }
    public DateTimeOffset FechaHora { get; set; }
}

public class MetricasResponse
{
    public double LatenciaPromedioQrMs { get; set; }
    public double LatenciaPromedioFacialMs { get; set; }
    public int EstacionesConcurrentes { get; set; }
    public int TotalEventosHoy { get; set; }
    public int TotalOperacionesHoy { get; set; }
}
