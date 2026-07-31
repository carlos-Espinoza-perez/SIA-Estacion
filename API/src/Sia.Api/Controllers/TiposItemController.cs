using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Items;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/tipos-item")]
[Authorize]
public class TiposItemController : SiaControllerBase
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
        var resultado = await _servicio.ObtenerTiposAsync(ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearTipoItemRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearTipoAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] CrearTipoItemRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarTipoAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarTipoAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}/atributos")]
    [RequierePrivilegio("TIP", "L")]
    public async Task<IActionResult> ObtenerAtributos(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerAtributosAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/atributos")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> CrearAtributo(Guid id, [FromBody] CrearAtributoRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAtributoAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("atributos/{atributoId:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> ActualizarAtributo(Guid atributoId, [FromBody] CrearAtributoRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAtributoAsync(atributoId, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("atributos/{atributoId:guid}")]
    [RequierePrivilegio("TIP", "E")]
    public async Task<IActionResult> EliminarAtributo(Guid atributoId, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAtributoAsync(atributoId, ct);
        return HandleResult(resultado);
    }
}
