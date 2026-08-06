using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Operaciones;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

public partial class EstacionApiController
{
    [HttpGet("items/{codigoQr}")]
    public async Task<IActionResult> EscanearItem(string codigoQr, [FromServices] ServicioItems servicioItems, CancellationToken ct)
    {
        var resultado = await servicioItems.ObtenerPorQrAsync(codigoQr, ct);
        return HandleResult(resultado);
    }

    [HttpPost("operaciones")]
    public async Task<IActionResult> CrearOperacion([FromBody] CrearOperacionRequest request, CancellationToken ct)
    {
        var resultado = await _servicioOperaciones.CrearOperacionAsync(request, ct);
        return HandleResult(resultado);
    }
}
