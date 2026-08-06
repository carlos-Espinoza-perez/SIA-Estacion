namespace Sia.Application.Dtos.Operaciones;

public class OperacionResponse
{
    public Guid Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public Guid ItemEscaneadoId { get; set; }
    public string ItemNombre { get; set; } = string.Empty;
    public Guid PersonaId { get; set; }
    public string PersonaNombre { get; set; } = string.Empty;
    public string CodigoEstudiantil { get; set; } = string.Empty;
    public Guid? EstacionId { get; set; }
    public string EstacionNombre { get; set; } = string.Empty;
    public string TipoOperacion { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
    public string Flujo { get; set; } = "Directo";
    public string? Observaciones { get; set; }
    public DateTimeOffset FechaSolicitud { get; set; }
    public DateTimeOffset? FechaCompromisoDevolucion { get; set; }
    public DateTimeOffset? FechaDevolucion { get; set; }
}

public class CambiarEstadoOperacionRequest
{
    public string? Observacion { get; set; }
}

public class OperacionDetalleResponse : OperacionResponse
{
    public List<DetalleItemResponse> Detalles { get; set; } = [];
    public List<MovimientoResponse> Movimientos { get; set; } = [];
}

public class DetalleItemResponse
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemNombre { get; set; } = string.Empty;
    public string? CondicionDevolucion { get; set; }
    public DateTimeOffset? FechaDevolucion { get; set; }
    public string? Observacion { get; set; }
}

public class MovimientoResponse
{
    public Guid Id { get; set; }
    public string EstadoAnterior { get; set; } = string.Empty;
    public string EstadoNuevo { get; set; } = string.Empty;
    public string? RegistradoPor { get; set; }
    public DateTimeOffset FechaHora { get; set; }
    public string? Observacion { get; set; }
}

public class CrearOperacionRequest
{
    public Guid ItemEscaneadoId { get; set; }
    public Guid PersonaId { get; set; }
    public Guid EstacionId { get; set; }
    public string? Observaciones { get; set; }
    public DateTimeOffset? FechaCompromisoDevolucion { get; set; }
}

public class DevolverRequest
{
    public List<DevolucionDetalleRequest> Detalles { get; set; } = [];
}

public class DevolucionDetalleRequest
{
    public Guid DetalleId { get; set; }
    public string CondicionDevolucion { get; set; } = string.Empty;
    public string? Observacion { get; set; }
}
