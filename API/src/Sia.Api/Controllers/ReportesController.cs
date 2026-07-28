using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Reportes;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/reportes")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly ServicioReportes _servicio;

    public ReportesController(ServicioReportes servicio)
    {
        _servicio = servicio;
    }

    [HttpGet("presencia")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerPresencia(CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPresenciaActualAsync(ct);
        return Ok(RespuestaEnvuelta<List<PresenciaResponse>>.Exitosa(resultado));
    }

    [HttpGet("accesos")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerAccesos([FromQuery] DateTimeOffset desde, [FromQuery] DateTimeOffset hasta, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerHistorialAccesoAsync(desde, hasta, ct);
        return Ok(RespuestaEnvuelta<List<EventoReporteResponse>>.Exitosa(resultado));
    }

    [HttpGet("prestamos-vencidos")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerPrestamosVencidos(CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPrestamosVencidosAsync(ct);
        return Ok(RespuestaEnvuelta<List<PrestamoVencidoResponse>>.Exitosa(resultado));
    }

    [HttpGet("trazabilidad-item/{itemId:guid}")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerTrazabilidad(Guid itemId, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTrazabilidadItemAsync(itemId, ct);
        return Ok(RespuestaEnvuelta<TrazabilidadItemResponse>.Exitosa(resultado));
    }
}
