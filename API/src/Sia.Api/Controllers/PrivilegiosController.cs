using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/privilegios")]
[Authorize]
public class PrivilegiosController : ControllerBase
{
    private readonly ServicioPrivilegios _servicio;

    public PrivilegiosController(ServicioPrivilegios servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        List<PrivilegioResponse> resultado = await _servicio.ObtenerTodosAsync(ct);
        return Ok(RespuestaEnvuelta<List<PrivilegioResponse>>.Exitosa(resultado));
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearPrivilegioRequest request, CancellationToken ct)
    {
        PrivilegioResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerTodos), null, RespuestaEnvuelta<PrivilegioResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarPrivilegioRequest request, CancellationToken ct)
    {
        PrivilegioResponse resultado = await _servicio.ActualizarAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<PrivilegioResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }
}
