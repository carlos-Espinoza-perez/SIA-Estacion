using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Estaciones;
using Sia.Application.Dtos.Items;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioEstaciones
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;
    private readonly IServicioHashSecreto _hashService;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioEstaciones(SiaDbContext db, IMapper mapper, IServicioHashSecreto hashService, IContextoEmpresa contextoEmpresa)
    {
        _db = db;
        _mapper = mapper;
        _hashService = hashService;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<List<EstacionResponse>> ObtenerTodasAsync(CancellationToken ct)
    {
        List<Estacion> estaciones = await _db.Estaciones.Where(e => e.Estado).OrderBy(e => e.Nombre).ToListAsync(ct);
        return _mapper.Map<List<EstacionResponse>>(estaciones);
    }

    public async Task<EstacionResponse> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Estacion estacion = await _db.Estaciones.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Estacion), id);
        return _mapper.Map<EstacionResponse>(estacion);
    }

    public async Task<CrearEstacionResponse> CrearAsync(CrearEstacionRequest request, CancellationToken ct)
    {
        string clientId = $"EST-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        string secretoPlano = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));

        var estacion = new Estacion
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            Nombre = request.Nombre,
            Ubicacion = request.Ubicacion,
            ClientId = clientId,
            ClientSecretHash = _hashService.Hash(secretoPlano),
            RequiereIdentificacion = request.RequiereIdentificacion,
            RequiereAprobacion = request.RequiereAprobacion
        };

        _db.Estaciones.Add(estacion);
        await _db.SaveChangesAsync(ct);

        EstacionResponse baseResponse = _mapper.Map<EstacionResponse>(estacion);
        return new CrearEstacionResponse
        {
            Id = baseResponse.Id,
            Nombre = baseResponse.Nombre,
            Ubicacion = baseResponse.Ubicacion,
            ClientId = baseResponse.ClientId,
            RequiereIdentificacion = baseResponse.RequiereIdentificacion,
            RequiereAprobacion = baseResponse.RequiereAprobacion,
            Estado = baseResponse.Estado,
            UltimaSincronizacion = baseResponse.UltimaSincronizacion,
            ClientSecret = secretoPlano
        };
    }

    public async Task<EstacionResponse> ActualizarAsync(Guid id, ActualizarEstacionRequest request, CancellationToken ct)
    {
        Estacion estacion = await _db.Estaciones.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Estacion), id);

        estacion.Nombre = request.Nombre;
        estacion.Ubicacion = request.Ubicacion;
        estacion.RequiereIdentificacion = request.RequiereIdentificacion;
        estacion.RequiereAprobacion = request.RequiereAprobacion;
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<EstacionResponse>(estacion);
    }

    public async Task EliminarAsync(Guid id, CancellationToken ct)
    {
        Estacion estacion = await _db.Estaciones.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Estacion), id);
        estacion.Estado = false;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<string> RegenerarSecretoAsync(Guid id, CancellationToken ct)
    {
        Estacion estacion = await _db.Estaciones.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Estacion), id);

        string nuevoSecreto = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        estacion.ClientSecretHash = _hashService.Hash(nuevoSecreto);
        await _db.SaveChangesAsync(ct);

        return nuevoSecreto;
    }

    public async Task<List<TipoItemResponse>> ObtenerTiposItemAsync(Guid estacionId, CancellationToken ct)
    {
        List<EstacionTipoItem> asignaciones = await _db.EstacionTiposItem
            .Include(eti => eti.TipoItem)
            .Where(eti => eti.EstacionId == estacionId && eti.Estado)
            .ToListAsync(ct);

        return asignaciones.Select(a => _mapper.Map<TipoItemResponse>(a.TipoItem)).ToList();
    }

    public async Task ReemplazarTiposItemAsync(Guid estacionId, TipoItemEstacionRequest request, CancellationToken ct)
    {
        List<EstacionTipoItem> existentes = await _db.EstacionTiposItem
            .Where(eti => eti.EstacionId == estacionId)
            .ToListAsync(ct);

        _db.EstacionTiposItem.RemoveRange(existentes);

        foreach (Guid tipoItemId in request.TipoItemIds)
        {
            _db.EstacionTiposItem.Add(new EstacionTipoItem
            {
                Id = Guid.NewGuid(),
                EmpresaId = _contextoEmpresa.EmpresaId,
                EstacionId = estacionId,
                TipoItemId = tipoItemId
            });
        }

        await _db.SaveChangesAsync(ct);
    }
}
