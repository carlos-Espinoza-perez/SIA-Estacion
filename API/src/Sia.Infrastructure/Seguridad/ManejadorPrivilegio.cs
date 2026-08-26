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
        if (context.User.IsInRole("Administrador General") || 
            context.User.IsInRole("Administrador Global") || 
            context.User.IsInRole("Administrador"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var privilegios = _contextoUsuario.Privilegios.ToList();

        var nivelRequerido = requirement.NivelRequerido.ToUpperInvariant();
        var codigo = requirement.CodigoPrivilegio.ToUpperInvariant();

        // Acceso exacto o Total
        if (privilegios.Contains($"{codigo}:{nivelRequerido}") || privilegios.Contains($"{codigo}:T"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Jerarquías adicionales
        bool tienePrivilegio = false;
        switch (nivelRequerido)
        {
            case "L": // Lectura es satisfecha por C, A, B, E, T
                tienePrivilegio = privilegios.Contains($"{codigo}:C") ||
                                  privilegios.Contains($"{codigo}:A") ||
                                  privilegios.Contains($"{codigo}:B") ||
                                  privilegios.Contains($"{codigo}:E");
                break;
            case "C": // Crear es satisfecho por Escritura
            case "A": // Actualizar es satisfecho por Escritura
                tienePrivilegio = privilegios.Contains($"{codigo}:E");
                break;
            case "E": // Escritura requiere C y A o E
                tienePrivilegio = privilegios.Contains($"{codigo}:C") && privilegios.Contains($"{codigo}:A");
                break;
            case "B": // Borrar requiere B o T (ya cubierto arriba con T o exacto)
                break;
        }

        if (tienePrivilegio)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
