using Sia.Application.Abstracciones;
using Sia.Domain.Constantes;

namespace Sia.Api.Middleware;

public class ContextoEmpresaMiddleware
{
    private readonly RequestDelegate _siguiente;

    public ContextoEmpresaMiddleware(RequestDelegate siguiente)
    {
        _siguiente = siguiente;
    }

    public async Task InvokeAsync(HttpContext contexto, IContextoEmpresa contextoEmpresa)
    {
        string? empresaIdClaim = contexto.User.FindFirst(Domain.Constantes.ClaimTypes.EmpresaId)?.Value;
        if (empresaIdClaim is not null && Guid.TryParse(empresaIdClaim, out Guid empresaId))
        {
            contextoEmpresa.Establecer(empresaId);
        }

        await _siguiente(contexto);
    }
}
