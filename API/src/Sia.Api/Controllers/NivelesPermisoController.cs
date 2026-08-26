using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/niveles-permiso")]
[Authorize]
public class NivelesPermisoController : SiaControllerBase
{
    private readonly ServicioNivelesPermiso _servicio;

    public NivelesPermisoController(ServicioNivelesPermiso servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("ROL", "L")]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerTodosAsync(ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("ROL", "C")]
    public async Task<IActionResult> Crear([FromBody] CrearNivelPermisoRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("ROL", "A")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] CrearNivelPermisoRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("ROL", "B")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }
}
