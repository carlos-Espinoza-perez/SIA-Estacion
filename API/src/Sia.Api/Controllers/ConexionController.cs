using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/connect")]
public class ConexionController : SiaControllerBase
{
    private readonly ServicioAuth _servicio;
    private readonly IServicioHashSecreto _hashService;

    public ConexionController(ServicioAuth servicio, IServicioHashSecreto hashService)
    {
        _servicio = servicio;
        _hashService = hashService;
    }

    [HttpPost("token")]
    [AllowAnonymous]
    public async Task<IActionResult> Token([FromBody] ClientCredentialsRequest request, CancellationToken ct)
    {
        Result<TokenResponse> resultado = await _servicio.ClientCredentialsAsync(request, _hashService, ct);
        return HandleResult(resultado);
    }
}
