using System.Security.Claims;

namespace Sia.Application.Abstracciones;

public interface IServicioJwt
{
    string GenerarTokenAcceso(IEnumerable<Claim> claims);
    string GenerarRefreshToken();
    ClaimsPrincipal? ValidarTokenExpirado(string token);
    string GenerarTokenEstacion(Guid estacionId, Guid empresaId, string clientId);
}
