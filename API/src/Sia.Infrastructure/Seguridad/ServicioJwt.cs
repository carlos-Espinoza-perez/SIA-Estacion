using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sia.Application.Configuracion;
using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Seguridad;

public class ServicioJwt : IServicioJwt
{
    private readonly JwtOpciones _opciones;
    private readonly SigningCredentials _credenciales;

    public ServicioJwt(IOptions<JwtOpciones> opciones)
    {
        _opciones = opciones.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opciones.SigningKey));
        _credenciales = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public string GenerarTokenAcceso(IEnumerable<Claim> claims)
    {
        var token = new JwtSecurityToken(
            issuer: _opciones.Issuer,
            audience: _opciones.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_opciones.AccessTokenMinutes),
            signingCredentials: _credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerarRefreshToken()
    {
        byte[] randomBytes = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public ClaimsPrincipal? ValidarTokenExpirado(string token)
    {
        var parametros = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _opciones.Issuer,
            ValidAudience = _opciones.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opciones.SigningKey))
        };

        try
        {
            ClaimsPrincipal principal = new JwtSecurityTokenHandler().ValidateToken(token, parametros, out SecurityToken validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public string GenerarTokenEstacion(Guid estacionId, Guid empresaId, string clientId)
    {
        var claims = new List<Claim>
        {
            new(Domain.Constantes.ClaimTypes.EstacionId, estacionId.ToString()),
            new(Domain.Constantes.ClaimTypes.EmpresaId, empresaId.ToString()),
            new(Domain.Constantes.ClaimTypes.ClientId, clientId),
            new("token_type", "estacion")
        };

        var token = new JwtSecurityToken(
            issuer: _opciones.Issuer,
            audience: _opciones.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_opciones.EstacionTokenMinutes),
            signingCredentials: _credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
