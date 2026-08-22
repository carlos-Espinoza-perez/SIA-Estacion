using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Google.Apis.Auth;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Constantes;
using Sia.Domain.Entidades;

namespace Sia.Application.Servicios;

public class ServicioAuth
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IServicioJwt _servicioJwt;
    private readonly ISeguridadRepository _seguridadRepository;
    private readonly IPersonasRepository _personasRepository;
    private readonly IEstacionesRepository _estacionesRepository;
    private readonly IConfiguration _configuration;

    public ServicioAuth(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IServicioJwt servicioJwt,
        ISeguridadRepository seguridadRepository,
        IPersonasRepository personasRepository,
        IEstacionesRepository estacionesRepository,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _servicioJwt = servicioJwt;
        _seguridadRepository = seguridadRepository;
        _personasRepository = personasRepository;
        _estacionesRepository = estacionesRepository;
        _configuration = configuration;
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

    public async Task<Result<TokenResponse>> GoogleLoginAsync(GoogleLoginRequest request, CancellationToken ct)
    {
        try
        {
            var clientId = _configuration["Google:ClientId"];
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            
            if (!string.IsNullOrEmpty(clientId) && clientId != "YOUR_GOOGLE_CLIENT_ID")
            {
                settings.Audience = new[] { clientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);

            if (payload == null)
                return Result<TokenResponse>.Fallido(CodigosError.CredencialesInvalidas, "Token de Google inválido.");

            IdentityUser? usuario = await _userManager.FindByEmailAsync(payload.Email);
            if (usuario is null)
                return Result<TokenResponse>.Fallido("USUARIO_NO_ENCONTRADO", "El usuario no está registrado en el sistema. Solicite acceso.");

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
        catch (InvalidJwtException)
        {
            return Result<TokenResponse>.Fallido(CodigosError.CredencialesInvalidas, "Token de Google inválido o expirado.");
        }
        catch (Exception)
        {
            return Result<TokenResponse>.Fallido("ERROR_GOOGLE_LOGIN", "Ocurrió un error al procesar el inicio de sesión con Google.");
        }
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

        Persona? persona = await _personasRepository.ObtenerPorUserIdAsync(userId, ct);
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
        Estacion? estacion = await _estacionesRepository.ObtenerPorClientIdAsync(request.ClientId, ct);

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

    public async Task<Result<TokenResponse>> LoginQrAsync(LoginQrRequest request, CancellationToken ct)
    {
        Persona? persona = await _personasRepository.ObtenerPorCodigoAsync(request.CodigoQr, ct);
        
        if (persona is null || !persona.Estado)
            return Result<TokenResponse>.Fallido(CodigosError.PersonaNoEncontrada, "Código QR inválido o persona inactiva.");

        List<Claim> claims = new();

        if (!string.IsNullOrEmpty(persona.UserId))
        {
            IdentityUser? usuario = await _userManager.FindByIdAsync(persona.UserId);
            if (usuario is not null)
            {
                claims = await ConstruirClaimsUsuarioAsync(usuario, ct);
            }
        }
        
        if (!claims.Any())
        {
            claims = new List<Claim>
            {
                new Claim(System.Security.Claims.ClaimTypes.NameIdentifier, persona.Id.ToString()),
                new Claim(Domain.Constantes.ClaimTypes.PersonaId, persona.Id.ToString()),
                new Claim(Domain.Constantes.ClaimTypes.EmpresaId, persona.EmpresaId.ToString()),
                new Claim(System.Security.Claims.ClaimTypes.Role, "Estudiante")
            };
        }

        string accessToken = _servicioJwt.GenerarTokenAcceso(claims);
        string refreshToken = _servicioJwt.GenerarRefreshToken();

        return Result<TokenResponse>.Exitoso(new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresInMinutes = 30
        });
    }

    private async Task<List<Claim>> ConstruirClaimsUsuarioAsync(IdentityUser usuario, CancellationToken ct)
    {
        var claims = new List<Claim>
        {
            new(System.Security.Claims.ClaimTypes.NameIdentifier, usuario.Id),
            new(System.Security.Claims.ClaimTypes.Email, usuario.Email ?? string.Empty),
        };

        Persona? persona = await _personasRepository.ObtenerPorUserIdAsync(usuario.Id, ct);

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

        List<RolPrivilegio> rolPrivilegios = await _seguridadRepository.ObtenerPrivilegiosRolesAsync(roles, ct);

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
        List<RolPrivilegio> rolPrivilegios = await _seguridadRepository.ObtenerPrivilegiosRolesAsync(roles, ct);

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
