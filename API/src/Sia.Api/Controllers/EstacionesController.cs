using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Estaciones;
using Sia.Application.Dtos.Items;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/estaciones")]
[Authorize]
public class EstacionesController : ControllerBase
{
    private readonly ServicioEstaciones _servicio;

    public EstacionesController(ServicioEstaciones servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("EST", "L")]
    public async Task<IActionResult> ObtenerTodas(CancellationToken ct)
    {
        List<EstacionResponse> resultado = await _servicio.ObtenerTodasAsync(ct);
        return Ok(RespuestaEnvuelta<List<EstacionResponse>>.Exitosa(resultado));
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("EST", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        EstacionResponse resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return Ok(RespuestaEnvuelta<EstacionResponse>.Exitosa(resultado));
    }

    [HttpPost]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearEstacionRequest request, CancellationToken ct)
    {
        CrearEstacionResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id }, RespuestaEnvuelta<CrearEstacionResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarEstacionRequest request, CancellationToken ct)
    {
        EstacionResponse resultado = await _servicio.ActualizarAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<EstacionResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/regenerar-secreto")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> RegenerarSecreto(Guid id, CancellationToken ct)
    {
        string nuevoSecreto = await _servicio.RegenerarSecretoAsync(id, ct);
        return Ok(RespuestaEnvuelta<object>.Exitosa(new { clientSecret = nuevoSecreto }));
    }

    [HttpGet("{id:guid}/tipos-item")]
    [RequierePrivilegio("EST", "L")]
    public async Task<IActionResult> ObtenerTiposItem(Guid id, CancellationToken ct)
    {
        List<TipoItemResponse> resultado = await _servicio.ObtenerTiposItemAsync(id, ct);
        return Ok(RespuestaEnvuelta<List<TipoItemResponse>>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}/tipos-item")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> ReemplazarTiposItem(Guid id, [FromBody] TipoItemEstacionRequest request, CancellationToken ct)
    {
        await _servicio.ReemplazarTiposItemAsync(id, request, ct);
        return NoContent();
    }
}
