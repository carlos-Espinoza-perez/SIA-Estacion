using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Comunes;

namespace Sia.Api.Filtros;

// El JWT de una estacion es valido hasta que expira (hasta 60 min) sin importar
// lo que pase despues en la base de datos: desvincular o deshabilitar una estacion
// no revoca un token ya emitido. Este filtro cierra ese hueco revalidando en cada
// request contra la base de datos, en vez de confiar solo en la firma del token.
public class EstacionActivaFilter : IAsyncActionFilter
{
    private readonly IContextoUsuario _contextoUsuario;
    private readonly IEstacionesRepository _estacionesRepository;

    public EstacionActivaFilter(IContextoUsuario contextoUsuario, IEstacionesRepository estacionesRepository)
    {
        _contextoUsuario = contextoUsuario;
        _estacionesRepository = estacionesRepository;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (_contextoUsuario.EsEstacion && _contextoUsuario.EstacionId is Guid estacionId)
        {
            var estacion = await _estacionesRepository.ObtenerPorIdAsync(estacionId, context.HttpContext.RequestAborted);
            if (estacion is null || !estacion.EstaVinculada || !estacion.Estado)
            {
                context.Result = new UnauthorizedObjectResult(
                    RespuestaEnvuelta<object>.ConError("ESTACION_INVALIDA", "Esta estación ya no está vinculada o fue deshabilitada."));
                return;
            }
        }

        await next();
    }
}
