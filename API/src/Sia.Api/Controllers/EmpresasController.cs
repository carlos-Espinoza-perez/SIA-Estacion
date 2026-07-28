using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/empresas")]
[Authorize]
public class EmpresasController : ControllerBase
{
    private readonly ServicioEmpresas _servicio;

    public EmpresasController(ServicioEmpresas servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("EMP", "L")]
    public async Task<IActionResult> ObtenerTodas(CancellationToken ct)
    {
        List<EmpresaResponse> resultado = await _servicio.ObtenerTodasAsync(ct);
        return Ok(RespuestaEnvuelta<List<EmpresaResponse>>.Exitosa(resultado));
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("EMP", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        EmpresaResponse resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return Ok(RespuestaEnvuelta<EmpresaResponse>.Exitosa(resultado));
    }

    [HttpPost]
    [RequierePrivilegio("EMP", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearEmpresaRequest request, CancellationToken ct)
    {
        EmpresaResponse resultado = await _servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id }, RespuestaEnvuelta<EmpresaResponse>.Exitosa(resultado));
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("EMP", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarEmpresaRequest request, CancellationToken ct)
    {
        EmpresaResponse resultado = await _servicio.ActualizarAsync(id, request, ct);
        return Ok(RespuestaEnvuelta<EmpresaResponse>.Exitosa(resultado));
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("EMP", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        await _servicio.EliminarAsync(id, ct);
        return NoContent();
    }
}
