using Microsoft.AspNetCore.Identity;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioUsuarios
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IPersonasRepository _personasRepository;

    public ServicioUsuarios(UserManager<IdentityUser> userManager, IPersonasRepository personasRepository)
    {
        _userManager = userManager;
        _personasRepository = personasRepository;
    }

    public async Task<Result<List<UsuarioResponse>>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<IdentityUser> usuarios = _userManager.Users.ToList();
        var respuestas = new List<UsuarioResponse>();

        foreach (IdentityUser usuario in usuarios)
        {
            IList<string> roles = await _userManager.GetRolesAsync(usuario);
            Persona? persona = await _personasRepository.ObtenerPorUserIdAsync(usuario.Id, ct);

            respuestas.Add(new UsuarioResponse
            {
                Id = usuario.Id,
                Email = usuario.Email ?? string.Empty,
                PersonaId = persona?.Id,
                NombreCompleto = persona is not null ? $"{persona.Nombres} {persona.Apellidos}" : null,
                Roles = roles.ToList()
            });
        }

        return Result<List<UsuarioResponse>>.Exitoso(respuestas);
    }

    public async Task<Result<UsuarioResponse>> CrearAsync(CrearUsuarioRequest request, CancellationToken ct)
    {
        var usuario = new IdentityUser { UserName = request.Email, Email = request.Email };
        IdentityResult resultado = await _userManager.CreateAsync(usuario, request.Password);

        if (!resultado.Succeeded)
            return Result<UsuarioResponse>.Fallido("USUARIO_CREACION_FALLIDA", string.Join("; ", resultado.Errors.Select(e => e.Description)));

        if (request.Roles.Count > 0)
            await _userManager.AddToRolesAsync(usuario, request.Roles);

        if (request.PersonaId.HasValue)
        {
            Persona? persona = await _personasRepository.ObtenerPorIdAsync(request.PersonaId.Value, ct);
            if (persona is not null)
            {
                persona.UserId = usuario.Id;
                await _personasRepository.SaveChangesAsync(ct);
            }
        }

        return Result<UsuarioResponse>.Exitoso(new UsuarioResponse
        {
            Id = usuario.Id,
            Email = usuario.Email ?? string.Empty,
            PersonaId = request.PersonaId,
            Roles = request.Roles
        });
    }

    public async Task<Result<bool>> ActualizarAsync(string id, CrearUsuarioRequest request, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(id);
        if (usuario is null)
            throw new EntidadNoEncontradaException("Usuario", id);

        usuario.Email = request.Email;
        usuario.UserName = request.Email;
        await _userManager.UpdateAsync(usuario);
        
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<bool>> AsignarRolesAsync(string userId, AsignarRolesRequest request, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(userId);
        if (usuario is null)
            throw new EntidadNoEncontradaException("Usuario", userId);

        IList<string> rolesActuales = await _userManager.GetRolesAsync(usuario);
        await _userManager.RemoveFromRolesAsync(usuario, rolesActuales);
        await _userManager.AddToRolesAsync(usuario, request.Roles);
        
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<bool>> EliminarAsync(string id, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(id);
        if (usuario is null)
            throw new EntidadNoEncontradaException("Usuario", id);

        await _userManager.DeleteAsync(usuario);
        
        return Result<bool>.Exitoso(true);
    }
}
