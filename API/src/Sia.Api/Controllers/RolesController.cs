using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController : SiaControllerBase
{
    private readonly ServicioRoles _servicio;

    public RolesController(ServicioRoles servicio)
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
    public async Task<IActionResult> Crear([FromBody] CrearRolRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id}")]
    [RequierePrivilegio("ROL", "A")]
    public async Task<IActionResult> Actualizar(string id, [FromBody] CrearRolRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id}")]
    [RequierePrivilegio("ROL", "B")]
    public async Task<IActionResult> Eliminar(string id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id}/privilegios")]
    [RequierePrivilegio("ROL", "L")]
    public async Task<IActionResult> ObtenerPrivilegios(string id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPrivilegiosRolAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id}/privilegios")]
    [RequierePrivilegio("ROL", "A")]
    public async Task<IActionResult> ReemplazarPrivilegios(string id, [FromBody] MatrizPrivilegiosRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ReemplazarMatrizAsync(id, request, ct);
        return HandleResult(resultado);
    }
}
