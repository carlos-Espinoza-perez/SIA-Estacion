using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Infrastructure.Persistencia.Repositorios;

public class EventosRepository : IEventosRepository
{
    private readonly SiaDbContext _db;

    public EventosRepository(SiaDbContext db)
    {
        _db = db;
    }

    public Task AgregarEventoAsync(EventoAcceso evento, CancellationToken ct)
    {
        _db.EventosAcceso.Add(evento);
        return Task.CompletedTask;
    }

    public Task AgregarEventosAsync(IEnumerable<EventoAcceso> eventos, CancellationToken ct)
    {
        _db.EventosAcceso.AddRange(eventos);
        return Task.CompletedTask;
    }

    public async Task<bool> ExisteEventoAsync(Guid id, CancellationToken ct)
    {
        return await _db.EventosAcceso.IgnoreQueryFilters().AnyAsync(e => e.Id == id, ct);
    }

    public async Task<List<EventoAcceso>> ObtenerPresenciaActualAsync(DateTimeOffset inicioDia, CancellationToken ct)
    {
        return await _db.EventosAcceso
            .Include(e => e.Persona)
            .Include(e => e.Estacion)
            .Where(e => e.FechaHoraLocal >= inicioDia && e.PersonaId != null && e.Resultado == ResultadoAcceso.Concedido)
            .GroupBy(e => e.PersonaId)
            .Select(g => g.OrderByDescending(e => e.FechaHoraLocal).First())
            .ToListAsync(ct);
    }

    public async Task<List<EventoAcceso>> ObtenerHistorialAccesoAsync(DateTimeOffset desde, DateTimeOffset hasta, CancellationToken ct)
    {
        return await _db.EventosAcceso
            .Include(e => e.Persona)
            .Include(e => e.Estacion)
            .Where(e => e.FechaHoraLocal >= desde && e.FechaHoraLocal <= hasta)
            .OrderByDescending(e => e.FechaHoraLocal)
            .ToListAsync(ct);
    }

    public async Task<int> ContarAuditoriaAsync(DateTimeOffset? desde, DateTimeOffset? hasta, string? entidad, string? busqueda, CancellationToken ct)
    {
        string[] userIdsMatching = Array.Empty<string>();
        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            string b = busqueda.Trim().ToLower();
            var fromPersonas = await _db.Personas
                .IgnoreQueryFilters()
                .Where(p => p.UserId != null && ((p.Nombres + " " + p.Apellidos).ToLower().Contains(b) || (p.CodigoEstudiantil != null && p.CodigoEstudiantil.ToLower().Contains(b))))
                .Select(p => p.UserId!)
                .ToListAsync(ct);

            var fromUsers = await _db.Users
                .Where(u => (u.UserName != null && u.UserName.ToLower().Contains(b)) || (u.Email != null && u.Email.ToLower().Contains(b)))
                .Select(u => u.Id)
                .ToListAsync(ct);

            userIdsMatching = fromPersonas.Concat(fromUsers).Distinct().ToArray();
        }

        IQueryable<AuditoriaCambio> query = AplicarFiltrosAuditoria(desde, hasta, entidad, busqueda, userIdsMatching);
        return await query.CountAsync(ct);
    }

    public async Task<List<AuditoriaCambio>> ObtenerAuditoriaAsync(DateTimeOffset? desde, DateTimeOffset? hasta, string? entidad, string? busqueda, int pagina, int limite, CancellationToken ct)
    {
        string[] userIdsMatching = Array.Empty<string>();
        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            string b = busqueda.Trim().ToLower();
            var fromPersonas = await _db.Personas
                .IgnoreQueryFilters()
                .Where(p => p.UserId != null && ((p.Nombres + " " + p.Apellidos).ToLower().Contains(b) || (p.CodigoEstudiantil != null && p.CodigoEstudiantil.ToLower().Contains(b))))
                .Select(p => p.UserId!)
                .ToListAsync(ct);

            var fromUsers = await _db.Users
                .Where(u => (u.UserName != null && u.UserName.ToLower().Contains(b)) || (u.Email != null && u.Email.ToLower().Contains(b)))
                .Select(u => u.Id)
                .ToListAsync(ct);

            userIdsMatching = fromPersonas.Concat(fromUsers).Distinct().ToArray();
        }

        IQueryable<AuditoriaCambio> query = AplicarFiltrosAuditoria(desde, hasta, entidad, busqueda, userIdsMatching);

        List<AuditoriaCambio> registros = await query
            .OrderByDescending(a => a.FechaHora)
            .Skip((pagina - 1) * limite)
            .Take(limite)
            .ToListAsync(ct);

        string[] userIds = registros.Where(a => !string.IsNullOrWhiteSpace(a.UserId)).Select(a => a.UserId!).Distinct().ToArray();

        if (userIds.Length == 0)
            return registros;

        Dictionary<string, string> nombresPersonas = await _db.Personas
            .IgnoreQueryFilters()
            .Where(p => p.UserId != null && userIds.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId!, p => $"{p.Nombres} {p.Apellidos}".Trim(), ct);
        Dictionary<string, string> nombresUsuarios = await _db.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.UserName ?? u.Email ?? "Usuario", ct);

        foreach (AuditoriaCambio registro in registros.Where(a => a.UserId is not null))
        {
            registro.NombreUsuario = nombresPersonas.GetValueOrDefault(registro.UserId!)
                ?? nombresUsuarios.GetValueOrDefault(registro.UserId!);
        }

        return registros;
    }

    private IQueryable<AuditoriaCambio> AplicarFiltrosAuditoria(
        DateTimeOffset? desde,
        DateTimeOffset? hasta,
        string? entidad,
        string? busqueda,
        string[] userIdsMatching)
    {
        IQueryable<AuditoriaCambio> query = _db.AuditoriaCambios;

        if (desde.HasValue)
            query = query.Where(a => a.FechaHora >= desde.Value);
        if (hasta.HasValue)
            query = query.Where(a => a.FechaHora <= hasta.Value);

        if (!string.IsNullOrWhiteSpace(entidad) && !entidad.Equals("Todos", StringComparison.OrdinalIgnoreCase))
        {
            if (entidad.Equals("Seguridad", StringComparison.OrdinalIgnoreCase))
            {
                var seg = new[] { "Persona", "Usuario", "ApplicationRole", "RolPrivilegio", "Privilegio", "NivelPermiso", "FotoReferencia" };
                query = query.Where(a => seg.Contains(a.Entidad));
            }
            else if (entidad.Equals("Ítem", StringComparison.OrdinalIgnoreCase) || entidad.Equals("Item", StringComparison.OrdinalIgnoreCase))
            {
                var itm = new[] { "Item", "TipoItem", "ItemAtributoValor", "ItemComposicion", "AtributoDefinicion" };
                query = query.Where(a => itm.Contains(a.Entidad));
            }
            else if (entidad.Equals("Operación", StringComparison.OrdinalIgnoreCase) || entidad.Equals("Operacion", StringComparison.OrdinalIgnoreCase))
            {
                var ops = new[] { "OperacionItem", "OperacionItemDetalle", "Prestamo" };
                query = query.Where(a => ops.Contains(a.Entidad));
            }
            else if (entidad.Equals("Acceso", StringComparison.OrdinalIgnoreCase))
            {
                var acc = new[] { "EventoAcceso", "Acceso" };
                query = query.Where(a => acc.Contains(a.Entidad));
            }
            else if (entidad.Equals("Configuración", StringComparison.OrdinalIgnoreCase) || entidad.Equals("Configuracion", StringComparison.OrdinalIgnoreCase))
            {
                var cfg = new[] { "Estacion", "Empresa", "EstacionTipoItem" };
                query = query.Where(a => cfg.Contains(a.Entidad));
            }
            else
            {
                query = query.Where(a => a.Entidad == entidad);
            }
        }

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            string b = busqueda.Trim().ToLower();
            query = query.Where(a =>
                (a.Descripcion != null && a.Descripcion.ToLower().Contains(b)) ||
                a.Entidad.ToLower().Contains(b) ||
                a.Accion.ToLower().Contains(b) ||
                a.Origen.ToLower().Contains(b) ||
                (a.ValoresNuevos != null && a.ValoresNuevos.ToLower().Contains(b)) ||
                (a.ValoresAnteriores != null && a.ValoresAnteriores.ToLower().Contains(b)) ||
                (userIdsMatching.Length > 0 && a.UserId != null && userIdsMatching.Contains(a.UserId))
            );
        }

        return query;
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> ContarAccesosHoyGlobalAsync(DateTimeOffset hoy, CancellationToken ct)
    {
        return await _db.EventosAcceso
            .IgnoreQueryFilters()
            .CountAsync(e => e.FechaHoraLocal >= hoy, ct);
    }
}
