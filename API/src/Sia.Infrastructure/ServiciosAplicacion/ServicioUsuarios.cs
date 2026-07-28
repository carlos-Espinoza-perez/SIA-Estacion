using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Dtos.Seguridad;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioUsuarios
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SiaDbContext _db;

    public ServicioUsuarios(UserManager<IdentityUser> userManager, SiaDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    public async Task<List<UsuarioResponse>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<IdentityUser> usuarios = await _userManager.Users.ToListAsync(ct);
        var respuestas = new List<UsuarioResponse>();

        foreach (IdentityUser usuario in usuarios)
        {
            IList<string> roles = await _userManager.GetRolesAsync(usuario);
            Persona? persona = await _db.Personas
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.UserId == usuario.Id, ct);

            respuestas.Add(new UsuarioResponse
            {
                Id = usuario.Id,
                Email = usuario.Email ?? string.Empty,
                PersonaId = persona?.Id,
                NombreCompleto = persona is not null ? $"{persona.Nombres} {persona.Apellidos}" : null,
                Roles = roles.ToList()
            });
        }

        return respuestas;
    }

    public async Task<UsuarioResponse> CrearAsync(CrearUsuarioRequest request, CancellationToken ct)
    {
        var usuario = new IdentityUser { UserName = request.Email, Email = request.Email };
        IdentityResult resultado = await _userManager.CreateAsync(usuario, request.Password);

        if (!resultado.Succeeded)
            throw new ReglaNegocioException("USUARIO_CREACION_FALLIDA",
                string.Join("; ", resultado.Errors.Select(e => e.Description)));

        if (request.Roles.Count > 0)
            await _userManager.AddToRolesAsync(usuario, request.Roles);

        if (request.PersonaId.HasValue)
        {
            Persona? persona = await _db.Personas.FindAsync([request.PersonaId.Value], ct);
            if (persona is not null)
            {
                persona.UserId = usuario.Id;
                await _db.SaveChangesAsync(ct);
            }
        }

        return new UsuarioResponse
        {
            Id = usuario.Id,
            Email = usuario.Email ?? string.Empty,
            PersonaId = request.PersonaId,
            Roles = request.Roles
        };
    }

    public async Task ActualizarAsync(string id, CrearUsuarioRequest request, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(id)
            ?? throw new EntidadNoEncontradaException("Usuario", id);

        usuario.Email = request.Email;
        usuario.UserName = request.Email;
        await _userManager.UpdateAsync(usuario);
    }

    public async Task AsignarRolesAsync(string userId, AsignarRolesRequest request, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(userId)
            ?? throw new EntidadNoEncontradaException("Usuario", userId);

        IList<string> rolesActuales = await _userManager.GetRolesAsync(usuario);
        await _userManager.RemoveFromRolesAsync(usuario, rolesActuales);
        await _userManager.AddToRolesAsync(usuario, request.Roles);
    }

    public async Task EliminarAsync(string id, CancellationToken ct)
    {
        IdentityUser? usuario = await _userManager.FindByIdAsync(id)
            ?? throw new EntidadNoEncontradaException("Usuario", id);

        await _userManager.DeleteAsync(usuario);
    }
}
