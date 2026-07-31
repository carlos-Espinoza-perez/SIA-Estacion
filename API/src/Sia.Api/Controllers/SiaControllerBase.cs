using Microsoft.AspNetCore.Mvc;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Resultados;
using Sia.Domain.Constantes;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class SiaControllerBase : ControllerBase
{
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.EsExitoso)
        {
            if (typeof(T) == typeof(bool))
                return NoContent();
                
            return Ok(RespuestaEnvuelta<T>.Exitosa(result.Valor!));
        }
            
        return HandleError(result.Error!);
    }

    private IActionResult HandleError(Error error)
    {
        return error.Codigo switch
        {
            CodigosError.PersonaNoEncontrada or "USUARIO_NO_ENCONTRADO" or "ITEM_NO_ENCONTRADO"
                => NotFound(RespuestaEnvuelta<object>.ConError(error.Codigo, error.Mensaje)),
                
            CodigosError.CredencialesInvalidas or CodigosError.TokenExpirado 
            or CodigosError.RefreshTokenInvalido or CodigosError.SecretoEstacionInvalido 
                => Unauthorized(RespuestaEnvuelta<object>.ConError(error.Codigo, error.Mensaje)),
                
            CodigosError.ConcurrenciaItem or CodigosError.ConcurrenciaOperacion 
            or CodigosError.CicloComposicion or CodigosError.EventoDuplicado 
                => Conflict(RespuestaEnvuelta<object>.ConError(error.Codigo, error.Mensaje)),
                
            _ => UnprocessableEntity(RespuestaEnvuelta<object>.ConError(error.Codigo, error.Mensaje))
        };
    }
}
