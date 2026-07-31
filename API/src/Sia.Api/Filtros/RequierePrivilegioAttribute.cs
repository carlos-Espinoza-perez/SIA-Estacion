using Microsoft.AspNetCore.Authorization;

namespace Sia.Api.Filtros;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequierePrivilegioAttribute : AuthorizeAttribute, IAuthorizationRequirement
{
    public string CodigoPrivilegio { get; }
    public string NivelRequerido { get; }

    public RequierePrivilegioAttribute(string codigoPrivilegio, string nivelRequerido)
        : base(policy: $"Privilegio_{codigoPrivilegio}_{nivelRequerido}")
    {
        CodigoPrivilegio = codigoPrivilegio;
        NivelRequerido = nivelRequerido;
        AuthenticationSchemes = "Bearer";
    }
}
