using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Dtos.Comunes;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/estacion-api")]
[Authorize] // Station client credentials will authorize these requests
public partial class EstacionApiController : ControllerBase
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
        ValidarAccesoResponse resultado = await _servicioAcceso.ValidarAsync(request, ct);
        return Ok(RespuestaEnvuelta<ValidarAccesoResponse>.Exitosa(resultado));
    }

    [HttpPost("sync/eventos")]
    public async Task<IActionResult> SincronizarEventos([FromBody] LoteEventosRequest request, CancellationToken ct)
    {
        await _servicioAcceso.ProcesarLoteAsync(request, ct);
        return Ok(RespuestaEnvuelta<object>.Exitosa(new { sincronizados = request.Eventos.Count }));
    }

    [HttpGet("sync/codigos")]
    public async Task<IActionResult> ObtenerCodigosSincronizacion(CancellationToken ct)
    {
        SincronizacionCodigosResponse resultado = await _servicioAcceso.ObtenerCodigosSincronizacionAsync(ct);
        return Ok(RespuestaEnvuelta<SincronizacionCodigosResponse>.Exitosa(resultado));
    }
}
