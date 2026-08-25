using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly ServicioReportes _servicioReportes;

    public StatsController(ServicioReportes servicioReportes)
    {
        _servicioReportes = servicioReportes;
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicStats(CancellationToken ct)
    {
        var result = await _servicioReportes.ObtenerEstadisticasPublicasAsync(ct);
        if (result.EsExitoso)
        {
            return Ok(result.Valor);
        }
        return BadRequest(result.Error);
    }
}
