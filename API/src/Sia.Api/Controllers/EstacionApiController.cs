using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/estacion-api")]
[Authorize]
public partial class EstacionApiController : SiaControllerBase
{
    private readonly ServicioAcceso _servicioAcceso;
    private readonly ServicioOperaciones _servicioOperaciones;

    public EstacionApiController(ServicioAcceso servicioAcceso, ServicioOperaciones servicioOperaciones)
    {
        _servicioAcceso = servicioAcceso;
        _servicioOperaciones = servicioOperaciones;
    }

    [HttpPost("validar")]
    public async Task<IActionResult> Validar([FromBody] ValidarAccesoRequest request, CancellationToken ct)
    {
        var resultado = await _servicioAcceso.ValidarAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPost("sync/eventos")]
    public async Task<IActionResult> SincronizarEventos([FromBody] LoteEventosRequest request, CancellationToken ct)
    {
        var resultado = await _servicioAcceso.ProcesarLoteAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpGet("sync/codigos")]
    public async Task<IActionResult> ObtenerCodigosSincronizacion(CancellationToken ct)
    {
        var resultado = await _servicioAcceso.ObtenerCodigosSincronizacionAsync(ct);
        return HandleResult(resultado);
    }
}
