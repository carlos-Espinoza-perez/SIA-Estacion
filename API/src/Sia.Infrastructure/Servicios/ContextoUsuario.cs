using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Servicios;

public class ContextoUsuario : IContextoUsuario
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ContextoUsuario(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Usuario => _httpContextAccessor.HttpContext?.User;

    public string? UserId => Usuario?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

    public Guid? PersonaId
    {
        get
        {
            string? valor = Usuario?.FindFirst(Domain.Constantes.ClaimTypes.PersonaId)?.Value;
            return valor is not null ? Guid.Parse(valor) : null;
        }
    }

    public Guid? EmpresaId
    {
        get
        {
            string? valor = Usuario?.FindFirst(Domain.Constantes.ClaimTypes.EmpresaId)?.Value;
            return valor is not null ? Guid.Parse(valor) : null;
        }
    }

    public Guid? EstacionId
    {
        get
        {
            string? valor = Usuario?.FindFirst(Domain.Constantes.ClaimTypes.EstacionId)?.Value;
            return valor is not null ? Guid.Parse(valor) : null;
        }
    }

    public bool EsEstacion => EstacionId.HasValue;

    public IEnumerable<string> Privilegios =>
        Usuario?.FindAll(Domain.Constantes.ClaimTypes.Privilegio).Select(c => c.Value) ?? [];
}
