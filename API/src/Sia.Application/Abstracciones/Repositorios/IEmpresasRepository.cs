using Sia.Domain.Entidades;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IEmpresasRepository
{
    Task<List<Empresa>> ObtenerTodasAsync(CancellationToken ct);
    Task<Empresa?> ObtenerPorIdAsync(Guid id, CancellationToken ct);
    Task AgregarAsync(Empresa empresa, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
