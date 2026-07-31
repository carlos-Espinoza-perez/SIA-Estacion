using Microsoft.AspNetCore.Authorization;
using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Seguridad;

public class RequisitoPrivilegio : IAuthorizationRequirement
{
    public string CodigoPrivilegio { get; }
    public string NivelRequerido { get; }

    public RequisitoPrivilegio(string codigoPrivilegio, string nivelRequerido)
    {
        CodigoPrivilegio = codigoPrivilegio;
        NivelRequerido = nivelRequerido;
    }
}

public class ManejadorPrivilegio : AuthorizationHandler<RequisitoPrivilegio>
{
    private readonly IContextoUsuario _contextoUsuario;

    public ManejadorPrivilegio(IContextoUsuario contextoUsuario)
    {
        _contextoUsuario = contextoUsuario;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RequisitoPrivilegio requirement)
    {
        if (context.User.IsInRole("Administrador Global"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var privilegios = _contextoUsuario.Privilegios.ToList();

        var nivelRequerido = requirement.NivelRequerido;
        var codigo = requirement.CodigoPrivilegio;

        bool tienePrivilegio = privilegios.Contains($"{codigo}:{nivelRequerido}") ||
                               privilegios.Contains($"{codigo}:E") || // Escritura incluye lectura
                               privilegios.Contains($"{codigo}:T");   // Total incluye todo

        if (tienePrivilegio)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
