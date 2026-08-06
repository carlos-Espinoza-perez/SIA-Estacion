using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Operaciones;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/operaciones")]
[Authorize]
public class OperacionesController : SiaControllerBase
{
    private readonly ServicioOperaciones _servicio;

    public OperacionesController(ServicioOperaciones servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("OPE", "L")]
    public async Task<IActionResult> ObtenerTodas(
        [FromQuery] string? busqueda,
        [FromQuery] string? estado,
        [FromQuery] Guid? estacionId,
        [FromQuery] Guid? personaId,
        CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTodasAsync(busqueda, estado, estacionId, personaId, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("OPE", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearOperacionRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearOperacionAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/aprobar")]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Aprobar(Guid id, [FromBody] CambiarEstadoOperacionRequest? request, CancellationToken ct)
    {
        var resultado = await _servicio.AprobarAsync(id, request?.Observacion, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/rechazar")]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Rechazar(Guid id, [FromBody] CambiarEstadoOperacionRequest? request, CancellationToken ct)
    {
        var resultado = await _servicio.RechazarAsync(id, request?.Observacion, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/entregar")]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Entregar(Guid id, [FromBody] CambiarEstadoOperacionRequest? request, CancellationToken ct)
    {
        var resultado = await _servicio.EntregarAsync(id, request?.Observacion, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/devolver")]
    [HttpPost("devolver/{id:guid}")]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Devolver(Guid id, [FromBody] DevolverRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.DevolverAsync(id, request, ct);
        return HandleResult(resultado);
    }
}
