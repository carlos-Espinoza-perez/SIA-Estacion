using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IPersonasRepository
{
    Task<List<Persona>> ObtenerTodasAsync(string? busqueda, TipoPersona? tipo, CancellationToken ct);
    Task<Persona?> ObtenerPorIdAsync(Guid id, CancellationToken ct);
    Task<Persona?> ObtenerPorCodigoAsync(string codigo, CancellationToken ct);
    Task<Persona?> ObtenerPorUserIdAsync(string userId, CancellationToken ct);
    Task<List<string>> ObtenerCodigosSincronizacionAsync(Guid empresaId, CancellationToken ct);
    Task AgregarAsync(Persona persona, CancellationToken ct);
    
    Task<FotoReferencia?> ObtenerFotoActivaAsync(Guid personaId, CancellationToken ct);
    Task AgregarFotoAsync(FotoReferencia foto, CancellationToken ct);
    
    Task SaveChangesAsync(CancellationToken ct);
}
