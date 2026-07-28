using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/niveles-permiso")]
[Authorize]
public class NivelesPermisoController : ControllerBase
{
    private readonly ServicioNivelesPermiso _servicio;

    public NivelesPermisoController(ServicioNivelesPermiso servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        List<NivelPermisoResponse> resultado = await _servicio.ObtenerTodosAsync(ct);
        return Ok(RespuestaEnvuelta<List<NivelPermisoResponse>>.Exitosa(resultado));
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearNivelPermisoRequest request, CancellationToken ct)
    {
        NivelPermisoResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerTodos), null, RespuestaEnvuelta<NivelPermisoResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] CrearNivelPermisoRequest request, CancellationToken ct)
    {
        NivelPermisoResponse resultado = await _servicio.ActualizarAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<NivelPermisoResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }
}
