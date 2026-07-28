using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Personas;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/personas")]
[Authorize]
public class PersonasController : ControllerBase
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
        List<PersonaResponse> resultado = await _servicio.ObtenerTodasAsync(busqueda, tipo, ct);
        return Ok(RespuestaEnvuelta<List<PersonaResponse>>.Exitosa(resultado));
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        PersonaDetalleResponse resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return Ok(RespuestaEnvuelta<PersonaDetalleResponse>.Exitosa(resultado));
    }

    [HttpGet("codigo/{codigo}")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerPorCodigo(string codigo, CancellationToken ct)
    {
        PersonaResponse resultado = await _servicio.ObtenerPorCodigoAsync(codigo, ct);
        return Ok(RespuestaEnvuelta<PersonaResponse>.Exitosa(resultado));
    }

    [HttpPost]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearPersonaRequest request, CancellationToken ct)
    {
        PersonaResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id }, RespuestaEnvuelta<PersonaResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarPersonaRequest request, CancellationToken ct)
    {
        PersonaResponse resultado = await _servicio.ActualizarAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<PersonaResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/foto")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> SubirFoto(Guid id, IFormFile foto, CancellationToken ct)
    {
        if (foto == null || foto.Length == 0)
            return BadRequest(RespuestaEnvuelta<object>.ConError("FOTO_REQUERIDA", "Se requiere un archivo de foto."));

        using Stream stream = foto.OpenReadStream();
        FotoReferenciaResponse resultado = await _servicio.SubirFotoAsync(id, stream, foto.ContentType, ct);
        
        return Ok(RespuestaEnvuelta<FotoReferenciaResponse>.Exitosa(resultado));
    }

    [HttpGet("{id:guid}/foto")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerUrlFoto(Guid id, CancellationToken ct)
    {
        string url = await _servicio.ObtenerUrlFotoAsync(id, ct);
        return Ok(RespuestaEnvuelta<string>.Exitosa(url));
    }

    [HttpDelete("{id:guid}/foto")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> EliminarFoto(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarFotoAsync(id, ct);
        return NoContent();
    }
}
