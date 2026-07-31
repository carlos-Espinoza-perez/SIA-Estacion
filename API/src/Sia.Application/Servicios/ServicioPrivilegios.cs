using AutoMapper;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioPrivilegios
{
    private readonly ISeguridadRepository _repository;
    private readonly IMapper _mapper;

    public ServicioPrivilegios(ISeguridadRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<List<PrivilegioResponse>>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<Privilegio> privilegios = await _repository.ObtenerPrivilegiosAsync(ct);
        return Result<List<PrivilegioResponse>>.Exitoso(_mapper.Map<List<PrivilegioResponse>>(privilegios));
    }

    public async Task<Result<PrivilegioResponse>> CrearAsync(CrearPrivilegioRequest request, CancellationToken ct)
    {
        var privilegio = _mapper.Map<Privilegio>(request);
        privilegio.Id = Guid.NewGuid();

        await _repository.AgregarPrivilegioAsync(privilegio, ct);
        await _repository.SaveChangesAsync(ct);

        return Result<PrivilegioResponse>.Exitoso(_mapper.Map<PrivilegioResponse>(privilegio));
    }

    public async Task<Result<PrivilegioResponse>> ActualizarAsync(Guid id, ActualizarPrivilegioRequest request, CancellationToken ct)
    {
        Privilegio? privilegio = await _repository.ObtenerPrivilegioPorIdAsync(id, ct);
        if (privilegio is null)
            throw new EntidadNoEncontradaException(nameof(Privilegio), id);

        privilegio.Nombre = request.Nombre;
        privilegio.Modulo = request.Modulo;
        await _repository.SaveChangesAsync(ct);

        return Result<PrivilegioResponse>.Exitoso(_mapper.Map<PrivilegioResponse>(privilegio));
    }

    public async Task<Result<bool>> EliminarAsync(Guid id, CancellationToken ct)
    {
        Privilegio? privilegio = await _repository.ObtenerPrivilegioPorIdAsync(id, ct);
        if (privilegio is null)
            throw new EntidadNoEncontradaException(nameof(Privilegio), id);

        privilegio.Estado = false;
        await _repository.SaveChangesAsync(ct);
        
        return Result<bool>.Exitoso(true);
    }
}
