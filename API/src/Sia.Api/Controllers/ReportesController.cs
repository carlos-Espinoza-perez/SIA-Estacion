using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Reportes;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/reportes")]
[Authorize]
public class ReportesController : SiaControllerBase
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
        return HandleResult(resultado);
    }

    [HttpGet("accesos")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerAccesos([FromQuery] DateTimeOffset desde, [FromQuery] DateTimeOffset hasta, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerHistorialAccesoAsync(desde, hasta, ct);
        return HandleResult(resultado);
    }

    [HttpGet("prestamos-vencidos")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerPrestamosVencidos(CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPrestamosVencidosAsync(ct);
        return HandleResult(resultado);
    }

    [HttpGet("trazabilidad-item/{itemId:guid}")]
    [RequierePrivilegio("REP", "L")]
    public async Task<IActionResult> ObtenerTrazabilidad(Guid itemId, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTrazabilidadItemAsync(itemId, ct);
        return HandleResult(resultado);
    }

    [HttpGet("auditoria")]
    [RequierePrivilegio("AUD", "L")]
    public async Task<IActionResult> ObtenerAuditoria(
        [FromQuery] DateTimeOffset? desde,
        [FromQuery] DateTimeOffset? hasta,
        [FromQuery] string? entidad,
        [FromQuery] string? busqueda,
        [FromQuery] int pagina = 1,
        [FromQuery] int limite = 10,
        CancellationToken ct = default)
    {
        var resultado = await _servicio.ObtenerAuditoriaAsync(desde, hasta, entidad, busqueda, pagina, limite, ct);
        return HandleResult(resultado);
    }

    [HttpGet("dashboard")]
    // [RequierePrivilegio("REP", "L")] // Or appropriate privilege
    public async Task<IActionResult> ObtenerMetricasDashboard(CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerMetricasDashboardAsync(ct);
        return HandleResult(resultado);
    }
}
