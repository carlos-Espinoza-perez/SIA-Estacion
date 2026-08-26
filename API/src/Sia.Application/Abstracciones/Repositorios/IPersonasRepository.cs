using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Application.Abstracciones.Repositorios;

public interface IPersonasRepository
{
    Task<List<Persona>> ObtenerTodasAsync(string? busqueda, TipoPersona? tipo, bool isPersonal, string? rol, bool? estado, int pagina, int limite, CancellationToken ct);
    Task<int> ContarPersonasAsync(string? busqueda, TipoPersona? tipo, bool isPersonal, string? rol, bool? estado, CancellationToken ct);
    Task<Persona?> ObtenerPorIdAsync(Guid id, CancellationToken ct);
    Task<Persona?> ObtenerPorCodigoAsync(string codigo, CancellationToken ct);
    Task<Persona?> ObtenerPorUserIdAsync(string userId, CancellationToken ct);
    Task<Dictionary<string, string>> ObtenerRolesPorUserIdsAsync(IEnumerable<string> userIds, CancellationToken ct);
    Task<List<string>> ObtenerCodigosSincronizacionAsync(Guid empresaId, CancellationToken ct);
    Task AgregarAsync(Persona persona, CancellationToken ct);
    
    Task<FotoReferencia?> ObtenerFotoActivaAsync(Guid personaId, CancellationToken ct);
    Task<FotoReferencia?> ObtenerFotoActivaAsync(Guid personaId, Guid fotoId, CancellationToken ct);
    Task<List<FotoReferencia>> ObtenerFotosActivasAsync(Guid personaId, CancellationToken ct);
    Task AgregarFotoAsync(FotoReferencia foto, CancellationToken ct);
    
    Task<int> ContarPersonasRegistradasGlobalAsync(CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
