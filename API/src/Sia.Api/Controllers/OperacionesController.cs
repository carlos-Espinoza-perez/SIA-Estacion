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

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("OPE", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost("devolver/{id:guid}")]
    [RequierePrivilegio("OPE", "E")]
    public async Task<IActionResult> Devolver(Guid id, [FromBody] DevolverRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.DevolverAsync(id, request, ct);
        return HandleResult(resultado);
    }
}
