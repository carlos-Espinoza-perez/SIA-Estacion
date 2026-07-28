using Microsoft.AspNetCore.Authorization;
using Sia.Domain.Constantes;

namespace Sia.Api.Filtros;

public class RequierePrivilegioHandler : AuthorizationHandler<RequierePrivilegioAttribute>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RequierePrivilegioAttribute requirement)
    {
        IEnumerable<string> privilegios = context.User
            .FindAll(Domain.Constantes.ClaimTypes.Privilegio)
            .Select(c => c.Value);

        string claimEsperado = $"{requirement.CodigoPrivilegio}:{requirement.NivelRequerido}";

        if (privilegios.Any(p => p.Equals(claimEsperado, StringComparison.OrdinalIgnoreCase)))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
