using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : SiaControllerBase
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
        return HandleResult(resultado);
    }

    [HttpPost("login-qr")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginQr([FromBody] LoginQrRequest request, CancellationToken ct)
    {
        Result<TokenResponse> resultado = await _servicio.LoginQrAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        Result<TokenResponse> resultado = await _servicio.RefreshAsync(request, ct);
        return HandleResult(resultado);
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
        return HandleResult(resultado);
    }
}
