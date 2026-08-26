using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : SiaControllerBase
{
    private readonly ServicioUsuarios _servicio;

    public UsuariosController(ServicioUsuarios servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("USU", "L")]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTodosAsync(ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("USU", "C")]
    public async Task<IActionResult> Crear([FromBody] CrearUsuarioRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id}")]
    [RequierePrivilegio("USU", "A")]
    public async Task<IActionResult> Actualizar(string id, [FromBody] CrearUsuarioRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id}/roles")]
    [RequierePrivilegio("USU", "A")]
    public async Task<IActionResult> AsignarRoles(string id, [FromBody] AsignarRolesRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.AsignarRolesAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id}")]
    [RequierePrivilegio("USU", "B")]
    public async Task<IActionResult> Eliminar(string id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }
}
