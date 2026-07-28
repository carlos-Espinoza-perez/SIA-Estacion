using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Dtos.Comunes;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioEmpresas
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;

    public ServicioEmpresas(SiaDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<EmpresaResponse>> ObtenerTodasAsync(CancellationToken ct)
    {
        List<Empresa> empresas = await _db.Empresas
            .IgnoreQueryFilters()
            .Where(e => e.Estado)
            .OrderBy(e => e.Nombre)
            .ToListAsync(ct);

        return _mapper.Map<List<EmpresaResponse>>(empresas);
    }

    public async Task<EmpresaResponse> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Empresa empresa = await _db.Empresas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Empresa), id);

        return _mapper.Map<EmpresaResponse>(empresa);
    }

    public async Task<EmpresaResponse> CrearAsync(CrearEmpresaRequest request, CancellationToken ct)
    {
        var empresa = _mapper.Map<Empresa>(request);
        empresa.Id = Guid.NewGuid();

        _db.Empresas.Add(empresa);
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<EmpresaResponse>(empresa);
    }

    public async Task<EmpresaResponse> ActualizarAsync(Guid id, ActualizarEmpresaRequest request, CancellationToken ct)
    {
        Empresa empresa = await _db.Empresas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Empresa), id);

        empresa.Nombre = request.Nombre;
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<EmpresaResponse>(empresa);
    }

    public async Task EliminarAsync(Guid id, CancellationToken ct)
    {
        Empresa empresa = await _db.Empresas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Empresa), id);

        empresa.Estado = false;
        await _db.SaveChangesAsync(ct);
    }
}
