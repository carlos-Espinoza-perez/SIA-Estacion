using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Dtos.Seguridad;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioNivelesPermiso
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;

    public ServicioNivelesPermiso(SiaDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<NivelPermisoResponse>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<NivelPermiso> niveles = await _db.NivelesPermiso
            .IgnoreQueryFilters()
            .Where(n => n.Estado)
            .OrderBy(n => n.Orden)
            .ToListAsync(ct);

        return _mapper.Map<List<NivelPermisoResponse>>(niveles);
    }

    public async Task<NivelPermisoResponse> CrearAsync(CrearNivelPermisoRequest request, CancellationToken ct)
    {
        var nivel = _mapper.Map<NivelPermiso>(request);
        nivel.Id = Guid.NewGuid();

        _db.NivelesPermiso.Add(nivel);
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<NivelPermisoResponse>(nivel);
    }

    public async Task<NivelPermisoResponse> ActualizarAsync(Guid id, CrearNivelPermisoRequest request, CancellationToken ct)
    {
        NivelPermiso nivel = await _db.NivelesPermiso
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(n => n.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(NivelPermiso), id);

        nivel.Codigo = request.Codigo;
        nivel.Nombre = request.Nombre;
        nivel.Orden = request.Orden;
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<NivelPermisoResponse>(nivel);
    }

    public async Task EliminarAsync(Guid id, CancellationToken ct)
    {
        NivelPermiso nivel = await _db.NivelesPermiso
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(n => n.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(NivelPermiso), id);

        nivel.Estado = false;
        await _db.SaveChangesAsync(ct);
    }
}
