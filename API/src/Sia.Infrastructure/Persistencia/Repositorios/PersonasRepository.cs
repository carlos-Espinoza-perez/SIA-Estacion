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

    public async Task<List<Persona>> ObtenerTodasAsync(string? busqueda, TipoPersona? tipo, CancellationToken ct)
    {
        IQueryable<Persona> query = _db.Personas.Include(p => p.FotosReferencia);

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(p => p.Nombres.Contains(busqueda) || p.Apellidos.Contains(busqueda) || p.CodigoEstudiantil.Contains(busqueda));

        if (tipo.HasValue)
            query = query.Where(p => p.TipoPersona == tipo.Value);

        return await query.Where(p => p.Estado).OrderBy(p => p.Apellidos).ToListAsync(ct);
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
}
