using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Infrastructure.ServiciosAplicacion;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ServicioAuth _servicio;

    public AuthController(ServicioAuth servicio)
    {
        _servicio = servicio;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        Result<TokenResponse> resultado = await _servicio.LoginAsync(request, ct);
        if (!resultado.EsExitoso)
            return Unauthorized(RespuestaEnvuelta<object>.ConError(resultado.Error!.Codigo, resultado.Error.Mensaje));

        return Ok(RespuestaEnvuelta<TokenResponse>.Exitosa(resultado.Valor!));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        Result<TokenResponse> resultado = await _servicio.RefreshAsync(request, ct);
        if (!resultado.EsExitoso)
            return Unauthorized(RespuestaEnvuelta<object>.ConError(resultado.Error!.Codigo, resultado.Error.Mensaje));

        return Ok(RespuestaEnvuelta<TokenResponse>.Exitosa(resultado.Valor!));
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(RespuestaEnvuelta<object>.Exitosa(new { mensaje = "Sesión cerrada." }));
    }

    [HttpGet("perfil")]
    [Authorize]
    public async Task<IActionResult> Perfil(CancellationToken ct)
    {
        string? userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null) return Unauthorized();

        Result<PerfilResponse> resultado = await _servicio.ObtenerPerfilAsync(userId, ct);
        if (!resultado.EsExitoso)
            return NotFound(RespuestaEnvuelta<object>.ConError(resultado.Error!.Codigo, resultado.Error.Mensaje));

        return Ok(RespuestaEnvuelta<PerfilResponse>.Exitosa(resultado.Valor!));
    }
}
