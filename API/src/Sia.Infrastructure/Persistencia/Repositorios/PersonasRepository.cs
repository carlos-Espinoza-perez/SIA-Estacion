using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class PersonasRepository : IPersonasRepository
{
    private readonly SiaDbContext _db;

    public PersonasRepository(SiaDbContext db)
    {
        _db = db;
    }

    public async Task<List<Persona>> ObtenerTodasAsync(string? busqueda, TipoPersona? tipo, bool isPersonal, string? rol, bool? estado, int pagina, int limite, CancellationToken ct)
    {
        IQueryable<Persona> query = _db.Personas.Include(p => p.FotosReferencia);

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(p => p.Nombres.Contains(busqueda) || p.Apellidos.Contains(busqueda) || p.CodigoEstudiantil.Contains(busqueda));

        if (tipo.HasValue)
            query = query.Where(p => p.TipoPersona == tipo.Value);
        else if (isPersonal)
            query = query.Where(p => p.TipoPersona != TipoPersona.Estudiante);

        if (estado.HasValue)
            query = query.Where(p => p.Estado == estado.Value);

        if (!string.IsNullOrWhiteSpace(rol))
        {
            var userIdsConRol = _db.UserRoles
                .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
                .Where(x => x.Name == rol)
                .Select(x => x.UserId);
            
            query = query.Where(p => userIdsConRol.Contains(p.UserId));
        }

        return await query
            .OrderBy(p => p.Apellidos)
            .Skip((pagina - 1) * limite)
            .Take(limite)
            .ToListAsync(ct);
    }

    public async Task<int> ContarPersonasAsync(string? busqueda, TipoPersona? tipo, bool isPersonal, string? rol, bool? estado, CancellationToken ct)
    {
        IQueryable<Persona> query = _db.Personas;

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(p => p.Nombres.Contains(busqueda) || p.Apellidos.Contains(busqueda) || p.CodigoEstudiantil.Contains(busqueda));

        if (tipo.HasValue)
            query = query.Where(p => p.TipoPersona == tipo.Value);
        else if (isPersonal)
            query = query.Where(p => p.TipoPersona != TipoPersona.Estudiante);

        if (estado.HasValue)
            query = query.Where(p => p.Estado == estado.Value);

        if (!string.IsNullOrWhiteSpace(rol))
        {
            var userIdsConRol = _db.UserRoles
                .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
                .Where(x => x.Name == rol)
                .Select(x => x.UserId);
            
            query = query.Where(p => userIdsConRol.Contains(p.UserId));
        }

        return await query.CountAsync(ct);
    }

    public async Task<Persona?> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Personas
            .Include(p => p.FotosReferencia)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<Persona?> ObtenerPorCodigoAsync(string codigo, CancellationToken ct)
    {
        return await _db.Personas
            .IgnoreQueryFilters()
            .Include(p => p.FotosReferencia)
            .FirstOrDefaultAsync(p => p.CodigoEstudiantil == codigo, ct);
    }

    public async Task<Persona?> ObtenerPorUserIdAsync(string userId, CancellationToken ct)
    {
        return await _db.Personas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
    }

    public async Task<List<string>> ObtenerCodigosSincronizacionAsync(Guid empresaId, CancellationToken ct)
    {
        return await _db.Personas
            .IgnoreQueryFilters()
            .Where(p => p.EmpresaId == empresaId && p.Estado)
            .Select(p => p.CodigoEstudiantil)
            .ToListAsync(ct);
    }

    public Task AgregarAsync(Persona persona, CancellationToken ct)
    {
        _db.Personas.Add(persona);
        return Task.CompletedTask;
    }

    public async Task<FotoReferencia?> ObtenerFotoActivaAsync(Guid personaId, CancellationToken ct)
    {
        return await _db.FotosReferencia.FirstOrDefaultAsync(f => f.PersonaId == personaId && f.Estado, ct);
    }

    public Task AgregarFotoAsync(FotoReferencia foto, CancellationToken ct)
    {
        _db.FotosReferencia.Add(foto);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> ContarPersonasRegistradasGlobalAsync(CancellationToken ct)
    {
        return await _db.Personas
            .IgnoreQueryFilters()
            .CountAsync(p => p.Estado, ct);
    }
}
