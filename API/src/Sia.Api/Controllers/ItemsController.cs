using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Items;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/items")]
[Authorize]
public class ItemsController : ControllerBase
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
        List<ItemResponse> resultado = await _servicio.ObtenerItemsAsync(busqueda, tipoItemId, estadoActual, ct);
        return Ok(RespuestaEnvuelta<List<ItemResponse>>.Exitosa(resultado));
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        ItemDetalleResponse resultado = await _servicio.ObtenerItemPorIdAsync(id, ct);
        return Ok(RespuestaEnvuelta<ItemDetalleResponse>.Exitosa(resultado));
    }

    [HttpGet("qr/{codigo}")]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerPorQr(string codigo, CancellationToken ct)
    {
        ItemResponse resultado = await _servicio.ObtenerPorQrAsync(codigo, ct);
        return Ok(RespuestaEnvuelta<ItemResponse>.Exitosa(resultado));
    }

    [HttpPost]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearItemRequest request, CancellationToken ct)
    {
        ItemResponse resultado = await _servicio.CrearItemAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id }, RespuestaEnvuelta<ItemResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarItemRequest request, CancellationToken ct)
    {
        ItemResponse resultado = await _servicio.ActualizarItemAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<ItemResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarItemAsync(id, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/componentes")]
    [RequierePrivilegio("ITM", "L")]
    public async Task<IActionResult> ObtenerComponentes(Guid id, CancellationToken ct)
    {
        List<ComponenteResponse> resultado = await _servicio.ObtenerComponentesAsync(id, ct);
        return Ok(RespuestaEnvuelta<List<ComponenteResponse>>.Exitosa(resultado));
    }

    [HttpPost("{id:guid}/componentes")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> AgregarComponente(Guid id, [FromBody] AgregarComponenteRequest request, CancellationToken ct)
    {
        await _servicio.AgregarComponenteAsync(id, request, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/componentes/{componenteId:guid}")]
    [RequierePrivilegio("ITM", "E")]
    public async Task<IActionResult> EliminarComponente(Guid id, Guid componenteId, CancellationToken ct)
    {
        await _servicio.EliminarComponenteAsync(id, componenteId, ct);
        return NoContent();
    }
}
