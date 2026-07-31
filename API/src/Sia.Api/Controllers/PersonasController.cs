using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Personas;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/personas")]
[Authorize]
public class PersonasController : SiaControllerBase
{
    private readonly ServicioPersonas _servicio;

    public PersonasController(ServicioPersonas servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerTodas([FromQuery] string? busqueda, [FromQuery] string? tipo, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTodasAsync(busqueda, tipo, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("codigo/{codigo}")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerPorCodigo(string codigo, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorCodigoAsync(codigo, ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearPersonaRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarPersonaRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/foto")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> SubirFoto(Guid id, IFormFile foto, CancellationToken ct)
    {
        if (foto == null || foto.Length == 0)
            return BadRequest(RespuestaEnvuelta<object>.ConError("FOTO_REQUERIDA", "Se requiere un archivo de foto."));

        using Stream stream = foto.OpenReadStream();
        var resultado = await _servicio.SubirFotoAsync(id, stream, foto.ContentType, ct);
        
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}/foto")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerUrlFoto(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerUrlFotoAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}/foto")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> EliminarFoto(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarFotoAsync(id, ct);
        return HandleResult(resultado);
    }
}
