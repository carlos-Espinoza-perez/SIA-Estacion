using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Estaciones;
using Sia.Application.Dtos.Items;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/estaciones")]
[Authorize]
public class EstacionesController : SiaControllerBase
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
        var resultado = await _servicio.ObtenerTodasAsync(ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("EST", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearEstacionRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarEstacionRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/regenerar-secreto")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> RegenerarSecreto(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.RegenerarSecretoAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}/tipos-item")]
    [RequierePrivilegio("EST", "L")]
    public async Task<IActionResult> ObtenerTiposItem(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTiposItemAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}/tipos-item")]
    [RequierePrivilegio("EST", "E")]
    public async Task<IActionResult> ReemplazarTiposItem(Guid id, [FromBody] TipoItemEstacionRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ReemplazarTiposItemAsync(id, request, ct);
        return HandleResult(resultado);
    }
}
