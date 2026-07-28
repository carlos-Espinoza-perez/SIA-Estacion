using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Operaciones;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/operaciones")]
[Authorize]
public class OperacionesController : ControllerBase
{
    private readonly ServicioOperaciones _servicio;

    public OperacionesController(ServicioOperaciones servicio)
    {
        _servicio = servicio;
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("OPE", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        OperacionDetalleResponse resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return Ok(RespuestaEnvuelta<OperacionDetalleResponse>.Exitosa(resultado));
    }

    [HttpPost("devolver/{id:guid}")]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Devolver(Guid id, [FromBody] DevolverRequest request, CancellationToken ct)
    {
        OperacionResponse resultado = await _servicio.DevolverAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<OperacionResponse>.Exitosa(resultado));
    }
}
