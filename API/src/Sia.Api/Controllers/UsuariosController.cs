using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly ServicioUsuarios _servicio;

    public UsuariosController(ServicioUsuarios servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        List<UsuarioResponse> resultado = await _servicio.ObtenerTodosAsync(ct);
        return Ok(RespuestaEnvuelta<List<UsuarioResponse>>.Exitosa(resultado));
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearUsuarioRequest request, CancellationToken ct)
    {
        UsuarioResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerTodos), null, RespuestaEnvuelta<UsuarioResponse>.Exitosa(resultado));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(string id, [FromBody] CrearUsuarioRequest request, CancellationToken ct)
    {
        await _servicio.ActualizarAsync(id, request, ct);
        return NoContent();
    }

    [HttpPost("{id}/roles")]
    public async Task<IActionResult> AsignarRoles(string id, [FromBody] AsignarRolesRequest request, CancellationToken ct)
    {
        await _servicio.AsignarRolesAsync(id, request, ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(string id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }
}
