using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/empresas")]
[Authorize]
public class EmpresasController : SiaControllerBase
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
        var resultado = await _servicio.ObtenerTodasAsync(ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("EMP", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("EMP", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearEmpresaRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("EMP", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarEmpresaRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("EMP", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }
}
