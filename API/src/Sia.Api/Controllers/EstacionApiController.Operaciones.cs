// Agregando endpoints para la estación interactuando con operaciones (Fase 9)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Operaciones;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

public partial class EstacionApiController
{
    [HttpGet("items/{codigoQr}")]
    public async Task<IActionResult> EscanearItem(string codigoQr, [FromServices] ServicioItems servicioItems, CancellationToken ct)
    {
        var item = await servicioItems.ObtenerPorQrAsync(codigoQr, ct);
        return Ok(RespuestaEnvuelta<object>.Exitosa(item));
    }

    [HttpPost("operaciones")]
    public async Task<IActionResult> CrearOperacion([FromBody] CrearOperacionRequest request, CancellationToken ct)
    {
        var operacion = await _servicioOperaciones.CrearOperacionAsync(request, ct);
        return Ok(RespuestaEnvuelta<object>.Exitosa(operacion));
    }
}
