using AutoMapper;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Estaciones;
using Sia.Application.Dtos.Items;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioEstaciones
{
    private readonly IEstacionesRepository _repository;
    private readonly IMapper _mapper;
    private readonly IServicioHashSecreto _hashService;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioEstaciones(IEstacionesRepository repository, IMapper mapper, IServicioHashSecreto hashService, IContextoEmpresa contextoEmpresa)
    {
        _repository = repository;
        _mapper = mapper;
        _hashService = hashService;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<Result<List<EstacionResponse>>> ObtenerTodasAsync(CancellationToken ct)
    {
        List<Estacion> estaciones = await _repository.ObtenerTodasAsync(ct);
        return Result<List<EstacionResponse>>.Exitoso(_mapper.Map<List<EstacionResponse>>(estaciones));
    }

    public async Task<Result<EstacionResponse>> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), id);
        return Result<EstacionResponse>.Exitoso(_mapper.Map<EstacionResponse>(estacion));
    }

    public async Task<Result<CrearEstacionResponse>> CrearAsync(CrearEstacionRequest request, CancellationToken ct)
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

        await _repository.AgregarAsync(estacion, ct);
        await _repository.SaveChangesAsync(ct);

        EstacionResponse baseResponse = _mapper.Map<EstacionResponse>(estacion);
        var response = new CrearEstacionResponse
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
        
        return Result<CrearEstacionResponse>.Exitoso(response);
    }

    public async Task<Result<EstacionResponse>> ActualizarAsync(Guid id, ActualizarEstacionRequest request, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), id);

        estacion.Nombre = request.Nombre;
        estacion.Ubicacion = request.Ubicacion;
        estacion.RequiereIdentificacion = request.RequiereIdentificacion;
        estacion.RequiereAprobacion = request.RequiereAprobacion;
        await _repository.SaveChangesAsync(ct);

        return Result<EstacionResponse>.Exitoso(_mapper.Map<EstacionResponse>(estacion));
    }

    public async Task<Result<bool>> EliminarAsync(Guid id, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), id);
            
        estacion.Estado = false;
        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<string>> RegenerarSecretoAsync(Guid id, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), id);

        string nuevoSecreto = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        estacion.ClientSecretHash = _hashService.Hash(nuevoSecreto);
        await _repository.SaveChangesAsync(ct);

        return Result<string>.Exitoso(nuevoSecreto);
    }

    public async Task<Result<List<TipoItemResponse>>> ObtenerTiposItemAsync(Guid estacionId, CancellationToken ct)
    {
        List<EstacionTipoItem> asignaciones = await _repository.ObtenerAsignacionesTiposItemAsync(estacionId, ct);
        var tipos = asignaciones.Where(a => a.Estado).Select(a => _mapper.Map<TipoItemResponse>(a.TipoItem)).ToList();
        return Result<List<TipoItemResponse>>.Exitoso(tipos);
    }

    public async Task<Result<bool>> ReemplazarTiposItemAsync(Guid estacionId, TipoItemEstacionRequest request, CancellationToken ct)
    {
        List<EstacionTipoItem> existentes = await _repository.ObtenerAsignacionesTiposItemAsync(estacionId, ct);
        await _repository.EliminarAsignacionesTiposItemAsync(existentes, ct);

        foreach (Guid tipoItemId in request.TipoItemIds)
        {
            await _repository.AgregarAsignacionTipoItemAsync(new EstacionTipoItem
            {
                Id = Guid.NewGuid(),
                EmpresaId = _contextoEmpresa.EmpresaId,
                EstacionId = estacionId,
                TipoItemId = tipoItemId
            }, ct);
        }

        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }
}
