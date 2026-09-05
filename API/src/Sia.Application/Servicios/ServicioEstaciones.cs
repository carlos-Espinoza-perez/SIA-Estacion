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
    private readonly IPairingCoordinator _pairingCoordinator;

    public ServicioEstaciones(
        IEstacionesRepository repository, 
        IMapper mapper, 
        IServicioHashSecreto hashService, 
        IContextoEmpresa contextoEmpresa,
        IPairingCoordinator pairingCoordinator)
    {
        _repository = repository;
        _mapper = mapper;
        _hashService = hashService;
        _contextoEmpresa = contextoEmpresa;
        _pairingCoordinator = pairingCoordinator;
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
            EncargadoId = request.EncargadoId,
            FirmwareVersion = request.FirmwareVersion,
            DireccionIp = request.DireccionIp,
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
            EncargadoId = baseResponse.EncargadoId,
            EncargadoNombre = baseResponse.EncargadoNombre,
            FirmwareVersion = baseResponse.FirmwareVersion,
            DireccionIp = baseResponse.DireccionIp,
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
        estacion.EncargadoId = request.EncargadoId;
        estacion.FirmwareVersion = request.FirmwareVersion;
        estacion.DireccionIp = request.DireccionIp;
        estacion.RequiereIdentificacion = request.RequiereIdentificacion;
        estacion.RequiereAprobacion = request.RequiereAprobacion;
        await _repository.SaveChangesAsync(ct);

        Estacion? estacionActualizada = await _repository.ObtenerPorIdAsync(id, ct);
        return Result<EstacionResponse>.Exitoso(_mapper.Map<EstacionResponse>(estacionActualizada ?? estacion));
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

    public async Task<Result<EstacionResponse>> VincularAsync(Guid id, VincularEstacionRequest request, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), id);

        string codigoLimpio = request.CodigoVinculacionOMac.Trim().ToUpperInvariant();
        if (string.IsNullOrEmpty(codigoLimpio))
            return Result<EstacionResponse>.Fallido("DATOS_INVALIDOS", "Debe ingresar el código QR o dirección MAC del dispositivo físico.");

        Estacion? otraEstacionConMismaMac = await _repository.ObtenerPorMacAsync(codigoLimpio, ct);
        if (otraEstacionConMismaMac is not null && otraEstacionConMismaMac.Id != id && otraEstacionConMismaMac.EstaVinculada)
        {
            return Result<EstacionResponse>.Fallido("DISPOSITIVO_YA_VINCULADO", 
                $"El dispositivo físico '{codigoLimpio}' ya se encuentra vinculado a la estación '{otraEstacionConMismaMac.Nombre}'. Desvinclúlelo primero.");
        }

        string nuevoSecreto = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        estacion.ClientSecretHash = _hashService.Hash(nuevoSecreto);
        estacion.MacAddress = codigoLimpio;
        estacion.EstaVinculada = true;
        estacion.CodigoVinculacion = null;
        estacion.FechaVinculacion = DateTimeOffset.UtcNow;
        estacion.UltimaSincronizacion = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(ct);

        // Notificar al coordinador en tiempo real para despertar el long-polling del ESP32
        var configProvisionada = new ConfiguracionEstacionProvisionadaResponse
        {
            EstacionId = estacion.Id,
            EstacionNombre = estacion.Nombre,
            ClientId = estacion.ClientId,
            ClientSecret = nuevoSecreto,
            RequiereIdentificacion = estacion.RequiereIdentificacion,
            RequiereAprobacion = estacion.RequiereAprobacion
        };
        _pairingCoordinator.NotificarVinculacion(codigoLimpio, configProvisionada);

        Estacion? estacionActualizada = await _repository.ObtenerPorIdAsync(id, ct);
        return Result<EstacionResponse>.Exitoso(_mapper.Map<EstacionResponse>(estacionActualizada ?? estacion));
    }

    public async Task<Result<bool>> DesvincularAsync(Guid id, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), id);

        estacion.EstaVinculada = false;
        estacion.MacAddress = null;
        estacion.CodigoVinculacion = null;
        estacion.FechaVinculacion = null;

        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<SolicitarPairingResponse>> SolicitarPairingAsync(SolicitarPairingRequest request, CancellationToken ct)
    {
        string macLimpia = request.MacAddress.Trim().ToUpperInvariant();
        string codigo = $"PAIR-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";

        return await Task.FromResult(Result<SolicitarPairingResponse>.Exitoso(new SolicitarPairingResponse
        {
            CodigoVinculacion = codigo,
            MacAddress = macLimpia,
            ExpiraEnMinutos = 15
        }));
    }

    public async Task<Result<VerificarPairingResponse>> VerificarPairingAsync(VerificarPairingRequest request, CancellationToken ct)
    {
        string macLimpia = request.MacAddress.Trim().ToUpperInvariant();
        Estacion? estacion = await _repository.ObtenerPorMacAsync(macLimpia, ct);

        if (estacion is null || !estacion.EstaVinculada)
        {
            return Result<VerificarPairingResponse>.Exitoso(new VerificarPairingResponse
            {
                Vinculada = false
            });
        }

        return Result<VerificarPairingResponse>.Exitoso(new VerificarPairingResponse
        {
            Vinculada = true,
            EstacionNombre = estacion.Nombre,
            ClientId = estacion.ClientId
        });
    }

    public async Task<Result<EstacionConfiguracionResponse>> ObtenerConfiguracionEstacionAsync(Guid estacionId, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(estacionId, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), estacionId);

        return Result<EstacionConfiguracionResponse>.Exitoso(new EstacionConfiguracionResponse
        {
            EstacionId = estacion.Id,
            Nombre = estacion.Nombre,
            Ubicacion = estacion.Ubicacion,
            RequiereIdentificacion = estacion.RequiereIdentificacion,
            RequiereAprobacion = estacion.RequiereAprobacion,
            Estado = estacion.Estado
        });
    }

    public async Task<Result<bool>> RegistrarHeartbeatAsync(Guid estacionId, HeartbeatEstacionRequest? request, CancellationToken ct)
    {
        Estacion? estacion = await _repository.ObtenerPorIdAsync(estacionId, ct);
        if (estacion is null)
            throw new EntidadNoEncontradaException(nameof(Estacion), estacionId);

        estacion.UltimaSincronizacion = DateTimeOffset.UtcNow;
        if (request != null)
        {
            if (!string.IsNullOrWhiteSpace(request.FirmwareVersion))
                estacion.FirmwareVersion = request.FirmwareVersion;
            if (!string.IsNullOrWhiteSpace(request.DireccionIp))
                estacion.DireccionIp = request.DireccionIp;
        }

        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }
}

