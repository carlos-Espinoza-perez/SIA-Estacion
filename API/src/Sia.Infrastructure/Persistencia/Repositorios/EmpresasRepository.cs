using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class EmpresasRepository : IEmpresasRepository
{
    private readonly SiaDbContext _db;

    public EmpresasRepository(SiaDbContext db)
    {
        _db = db;
    }

    public async Task<List<Empresa>> ObtenerTodasAsync(CancellationToken ct)
    {
        return await _db.Empresas
            .IgnoreQueryFilters()
            .Where(e => e.Estado)
            .OrderBy(e => e.Nombre)
            .ToListAsync(ct);
    }

    public async Task<Empresa?> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Empresas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public Task AgregarAsync(Empresa empresa, CancellationToken ct)
    {
        _db.Empresas.Add(empresa);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
