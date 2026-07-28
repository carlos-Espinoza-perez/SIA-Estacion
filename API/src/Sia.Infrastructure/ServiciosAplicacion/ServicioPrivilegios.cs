using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioPrivilegios
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;

    public ServicioPrivilegios(SiaDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<PrivilegioResponse>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<Privilegio> privilegios = await _db.Privilegios
            .IgnoreQueryFilters()
            .Where(p => p.Estado)
            .OrderBy(p => p.Modulo).ThenBy(p => p.Nombre)
            .ToListAsync(ct);

        return _mapper.Map<List<PrivilegioResponse>>(privilegios);
    }

    public async Task<PrivilegioResponse> CrearAsync(CrearPrivilegioRequest request, CancellationToken ct)
    {
        var privilegio = _mapper.Map<Privilegio>(request);
        privilegio.Id = Guid.NewGuid();

        _db.Privilegios.Add(privilegio);
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<PrivilegioResponse>(privilegio);
    }

    public async Task<PrivilegioResponse> ActualizarAsync(Guid id, ActualizarPrivilegioRequest request, CancellationToken ct)
    {
        Privilegio privilegio = await _db.Privilegios
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Privilegio), id);

        privilegio.Nombre = request.Nombre;
        privilegio.Modulo = request.Modulo;
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<PrivilegioResponse>(privilegio);
    }

    public async Task EliminarAsync(Guid id, CancellationToken ct)
    {
        Privilegio privilegio = await _db.Privilegios
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Privilegio), id);

        privilegio.Estado = false;
        await _db.SaveChangesAsync(ct);
    }
}
