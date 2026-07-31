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

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
