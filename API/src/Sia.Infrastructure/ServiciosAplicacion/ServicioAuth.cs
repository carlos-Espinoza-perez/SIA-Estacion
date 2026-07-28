using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Constantes;
using Sia.Domain.Entidades;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioAuth
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IServicioJwt _servicioJwt;
    private readonly SiaDbContext _db;

    public ServicioAuth(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IServicioJwt servicioJwt,
        SiaDbContext db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _servicioJwt = servicioJwt;
        _db = db;
    }

    public async Task<Result<TokenResponse>> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByEmailAsync(request.Email);
        if (usuario is null)
            return Result<TokenResponse>.Fallido(CodigosError.CredencialesInvalidas, "Credenciales incorrectas.");

        SignInResult resultado = await _signInManager.CheckPasswordSignInAsync(usuario, request.Password, lockoutOnFailure: false);
        if (!resultado.Succeeded)
            return Result<TokenResponse>.Fallido(CodigosError.CredencialesInvalidas, "Credenciales incorrectas.");

        List<Claim> claims = await ConstruirClaimsUsuarioAsync(usuario, ct);
        string accessToken = _servicioJwt.GenerarTokenAcceso(claims);
        string refreshToken = _servicioJwt.GenerarRefreshToken();

        return Result<TokenResponse>.Exitoso(new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresInMinutes = 30
        });
    }

    public async Task<Result<TokenResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct)
    {
        ClaimsPrincipal? principal = _servicioJwt.ValidarTokenExpirado(request.AccessToken);
        if (principal is null)
            return Result<TokenResponse>.Fallido(CodigosError.TokenExpirado, "Token inválido.");

        string? userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
            return Result<TokenResponse>.Fallido(CodigosError.TokenExpirado, "Token inválido.");

        IdentityUser? usuario = await _userManager.FindByIdAsync(userId);
        if (usuario is null)
            return Result<TokenResponse>.Fallido(CodigosError.TokenExpirado, "Usuario no encontrado.");

        List<Claim> claims = await ConstruirClaimsUsuarioAsync(usuario, ct);
        string accessToken = _servicioJwt.GenerarTokenAcceso(claims);
        string refreshToken = _servicioJwt.GenerarRefreshToken();

        return Result<TokenResponse>.Exitoso(new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresInMinutes = 30
        });
    }

    public async Task<Result<PerfilResponse>> ObtenerPerfilAsync(string userId, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(userId);
        if (usuario is null)
            return Result<PerfilResponse>.Fallido("USUARIO_NO_ENCONTRADO", "Usuario no encontrado.");

        Persona? persona = await _db.Personas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        IList<string> roles = await _userManager.GetRolesAsync(usuario);

        List<PrivilegioEfectivoDto> privilegiosEfectivos = await ResolverPrivilegiosEfectivosAsync(roles, ct);

        return Result<PerfilResponse>.Exitoso(new PerfilResponse
        {
            UserId = userId,
            Email = usuario.Email ?? string.Empty,
            EmpresaId = persona?.EmpresaId ?? Guid.Empty,
            PersonaId = persona?.Id ?? Guid.Empty,
            NombreCompleto = persona is not null ? $"{persona.Nombres} {persona.Apellidos}" : string.Empty,
            Roles = roles.ToList(),
            Privilegios = privilegiosEfectivos
        });
    }

    public async Task<Result<TokenResponse>> ClientCredentialsAsync(ClientCredentialsRequest request, IServicioHashSecreto hashService, CancellationToken ct)
    {
        Estacion? estacion = await _db.Estaciones
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.ClientId == request.ClientId && e.Estado, ct);

        if (estacion is null)
            return Result<TokenResponse>.Fallido(CodigosError.SecretoEstacionInvalido, "Estación no encontrada.");

        if (!hashService.Verificar(request.ClientSecret, estacion.ClientSecretHash))
            return Result<TokenResponse>.Fallido(CodigosError.SecretoEstacionInvalido, "Secreto inválido.");

        string token = _servicioJwt.GenerarTokenEstacion(estacion.Id, estacion.EmpresaId, estacion.ClientId);

        return Result<TokenResponse>.Exitoso(new TokenResponse
        {
            AccessToken = token,
            RefreshToken = string.Empty,
            ExpiresInMinutes = 60
        });
    }

    private async Task<List<Claim>> ConstruirClaimsUsuarioAsync(IdentityUser usuario, CancellationToken ct)
    {
        var claims = new List<Claim>
        {
            new(System.Security.Claims.ClaimTypes.NameIdentifier, usuario.Id),
            new(System.Security.Claims.ClaimTypes.Email, usuario.Email ?? string.Empty),
        };

        Persona? persona = await _db.Personas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == usuario.Id, ct);

        if (persona is not null)
        {
            claims.Add(new Claim(Domain.Constantes.ClaimTypes.PersonaId, persona.Id.ToString()));
            claims.Add(new Claim(Domain.Constantes.ClaimTypes.EmpresaId, persona.EmpresaId.ToString()));
        }

        IList<string> roles = await _userManager.GetRolesAsync(usuario);
        foreach (string rol in roles)
        {
            claims.Add(new Claim(System.Security.Claims.ClaimTypes.Role, rol));
        }

        List<RolPrivilegio> rolPrivilegios = await _db.RolPrivilegios
            .IgnoreQueryFilters()
            .Include(rp => rp.Privilegio)
            .Include(rp => rp.NivelPermiso)
            .Where(rp => roles.Contains(rp.RoleId) && rp.Estado)
            .ToListAsync(ct);

        foreach (RolPrivilegio rp in rolPrivilegios)
        {
            claims.Add(new Claim(
                Domain.Constantes.ClaimTypes.Privilegio,
                $"{rp.Privilegio.Codigo}:{rp.NivelPermiso.Codigo}"));
        }

        return claims;
    }

    private async Task<List<PrivilegioEfectivoDto>> ResolverPrivilegiosEfectivosAsync(IList<string> roles, CancellationToken ct)
    {
        List<RolPrivilegio> rolPrivilegios = await _db.RolPrivilegios
            .IgnoreQueryFilters()
            .Include(rp => rp.Privilegio)
            .Include(rp => rp.NivelPermiso)
            .Where(rp => roles.Contains(rp.RoleId) && rp.Estado)
            .ToListAsync(ct);

        return rolPrivilegios
            .GroupBy(rp => rp.Privilegio.Codigo)
            .Select(g => new PrivilegioEfectivoDto
            {
                Codigo = g.Key,
                Nombre = g.First().Privilegio.Nombre,
                Niveles = g.Select(rp => rp.NivelPermiso.Codigo).Distinct().ToList()
            })
            .ToList();
    }
}
