using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Items;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/items")]
[Authorize]
public class ItemsController : SiaControllerBase
{
    private readonly ServicioItems _servicio;

    public ItemsController(ServicioItems servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerTodos([FromQuery] string? busqueda, [FromQuery] Guid? tipoItemId, [FromQuery] string? estadoActual, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerItemsAsync(busqueda, tipoItemId, estadoActual, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerItemPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("qr/{codigo}")]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerPorQr(string codigo, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorQrAsync(codigo, ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearItemRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearItemAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarItemRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarItemAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarItemAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}/componentes")]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerComponentes(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerComponentesAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/componentes")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> AgregarComponente(Guid id, [FromBody] AgregarComponenteRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.AgregarComponenteAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}/componentes/{componenteId:guid}")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> EliminarComponente(Guid id, Guid componenteId, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarComponenteAsync(id, componenteId, ct);
        return HandleResult(resultado);
    }
}
