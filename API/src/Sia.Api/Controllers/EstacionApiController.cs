using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Acceso;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Estaciones;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/estacion-api")]
[Authorize]
public partial class EstacionApiController : SiaControllerBase
{
    private readonly ServicioAcceso _servicioAcceso;
    private readonly ServicioOperaciones _servicioOperaciones;
    private readonly ServicioEstaciones _servicioEstaciones;
    private readonly IPairingCoordinator _pairingCoordinator;
    private readonly IContextoUsuario _contextoUsuario;

    public EstacionApiController(
        ServicioAcceso servicioAcceso, 
        ServicioOperaciones servicioOperaciones,
        ServicioEstaciones servicioEstaciones,
        IPairingCoordinator pairingCoordinator,
        IContextoUsuario contextoUsuario)
    {
        _servicioAcceso = servicioAcceso;
        _servicioOperaciones = servicioOperaciones;
        _servicioEstaciones = servicioEstaciones;
        _pairingCoordinator = pairingCoordinator;
        _contextoUsuario = contextoUsuario;
    }

    [HttpGet("aprovisionamiento/esperar")]
    [AllowAnonymous]
    public async Task<IActionResult> EsperarAprovisionamiento([FromQuery] string identificador, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(identificador))
            return BadRequest(RespuestaEnvuelta<object>.ConError("DATOS_INVALIDOS", "El identificador (MAC address) es requerido."));

        var config = await _pairingCoordinator.EsperarConfiguracionAsync(
            identificador.Trim().ToUpperInvariant(), 
            TimeSpan.FromSeconds(30), 
            ct);

        if (config is null)
        {
            // Retornar 204 No Content para indicar al cliente HTTP que reintente
            return NoContent();
        }

        return Ok(RespuestaEnvuelta<ConfiguracionEstacionProvisionadaResponse>.Exitosa(config));
    }

    [HttpGet("configuracion")]
    public async Task<IActionResult> ObtenerConfiguracion(CancellationToken ct)
    {
        if (!_contextoUsuario.EstacionId.HasValue)
            return Unauthorized(RespuestaEnvuelta<object>.ConError("NO_AUTORIZADO", "El token no corresponde a una estación."));

        var resultado = await _servicioEstaciones.ObtenerConfiguracionEstacionAsync(_contextoUsuario.EstacionId.Value, ct);
        return HandleResult(resultado);
    }

    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat([FromBody] HeartbeatEstacionRequest? request, CancellationToken ct)
    {
        if (!_contextoUsuario.EstacionId.HasValue)
            return Unauthorized(RespuestaEnvuelta<object>.ConError("NO_AUTORIZADO", "El token no corresponde a una estación."));

        var resultado = await _servicioEstaciones.RegistrarHeartbeatAsync(_contextoUsuario.EstacionId.Value, request, ct);
        return HandleResult(resultado);
    }

    [HttpPost("validar")]
    public async Task<IActionResult> Validar([FromBody] ValidarAccesoRequest request, CancellationToken ct)
    {
        var resultado = await _servicioAcceso.ValidarAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPost("sync/eventos")]
    public async Task<IActionResult> SincronizarEventos([FromBody] LoteEventosRequest request, CancellationToken ct)
    {
        var resultado = await _servicioAcceso.ProcesarLoteAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpGet("sync/codigos")]
    public async Task<IActionResult> ObtenerCodigosSincronizacion(CancellationToken ct)
    {
        var resultado = await _servicioAcceso.ObtenerCodigosSincronizacionAsync(ct);
        return HandleResult(resultado);
    }
}

