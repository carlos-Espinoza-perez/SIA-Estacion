using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Items;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/tipos-item")]
[Authorize]
public class TiposItemController : ControllerBase
{
    private readonly ServicioItems _servicio;

    public TiposItemController(ServicioItems servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("TIP", "L")]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        List<TipoItemResponse> resultado = await _servicio.ObtenerTiposAsync(ct);
        return Ok(RespuestaEnvuelta<List<TipoItemResponse>>.Exitosa(resultado));
    }

    [HttpPost]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearTipoItemRequest request, CancellationToken ct)
    {
        TipoItemResponse resultado = await _servicio.CrearTipoAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerTodos), null, RespuestaEnvuelta<TipoItemResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] CrearTipoItemRequest request, CancellationToken ct)
    {
        TipoItemResponse resultado = await _servicio.ActualizarTipoAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<TipoItemResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarTipoAsync(id, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/atributos")]
    [RequierePrivilegio("TIP", "L")]
    public async Task<IActionResult> ObtenerAtributos(Guid id, CancellationToken ct)
    {
        List<AtributoDefinicionResponse> resultado = await _servicio.ObtenerAtributosAsync(id, ct);
        return Ok(RespuestaEnvuelta<List<AtributoDefinicionResponse>>.Exitosa(resultado));
    }

    [HttpPost("{id:guid}/atributos")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> CrearAtributo(Guid id, [FromBody] CrearAtributoRequest request, CancellationToken ct)
    {
        AtributoDefinicionResponse resultado = await _servicio.CrearAtributoAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<AtributoDefinicionResponse>.Exitosa(resultado));
    }

    [HttpPut("atributos/{atributoId:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> ActualizarAtributo(Guid atributoId, [FromBody] CrearAtributoRequest request, CancellationToken ct)
    {
        AtributoDefinicionResponse resultado = await _servicio.ActualizarAtributoAsync(atributoId, request, ct);
        return Ok(RespuestaEnvuelta<AtributoDefinicionResponse>.Exitosa(resultado));
    }

    [HttpDelete("atributos/{atributoId:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> EliminarAtributo(Guid atributoId, CancellationToken ct)
    {
        await _servicio.EliminarAtributoAsync(atributoId, ct);
        return NoContent();
    }
}
