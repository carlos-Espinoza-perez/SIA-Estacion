using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly ServicioRoles _servicio;

    public RolesController(ServicioRoles servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        List<RolResponse> resultado = await _servicio.ObtenerTodosAsync(ct);
        return Ok(RespuestaEnvuelta<List<RolResponse>>.Exitosa(resultado));
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearRolRequest request, CancellationToken ct)
    {
        RolResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerTodos), null, RespuestaEnvuelta<RolResponse>.Exitosa(resultado));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(string id, [FromBody] CrearRolRequest request, CancellationToken ct)
    {
        RolResponse resultado = await _servicio.ActualizarAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<RolResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(string id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }

    [HttpGet("{id}/privilegios")]
    public async Task<IActionResult> ObtenerPrivilegios(string id, CancellationToken ct)
    {
        List<RolPrivilegioResponse> resultado = await _servicio.ObtenerPrivilegiosRolAsync(id, ct);
        return Ok(RespuestaEnvuelta<List<RolPrivilegioResponse>>.Exitosa(resultado));
    }

    [HttpPut("{id}/privilegios")]
    public async Task<IActionResult> ReemplazarPrivilegios(string id, [FromBody] MatrizPrivilegiosRequest request, CancellationToken ct)
    {
        await _servicio.ReemplazarMatrizAsync(id, request, ct);
        return NoContent();
    }
}
