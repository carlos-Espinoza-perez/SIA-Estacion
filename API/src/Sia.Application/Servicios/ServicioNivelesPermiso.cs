using AutoMapper;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioNivelesPermiso
{
    private readonly ISeguridadRepository _repository;
    private readonly IMapper _mapper;

    public ServicioNivelesPermiso(ISeguridadRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<List<NivelPermisoResponse>>> ObtenerTodosAsync(CancellationToken ct)
    {
        List<NivelPermiso> niveles = await _repository.ObtenerNivelesPermisoAsync(ct);
        return Result<List<NivelPermisoResponse>>.Exitoso(_mapper.Map<List<NivelPermisoResponse>>(niveles));
    }

    public async Task<Result<NivelPermisoResponse>> CrearAsync(CrearNivelPermisoRequest request, CancellationToken ct)
    {
        var nivel = _mapper.Map<NivelPermiso>(request);
        nivel.Id = Guid.NewGuid();

        await _repository.AgregarNivelPermisoAsync(nivel, ct);
        await _repository.SaveChangesAsync(ct);

        return Result<NivelPermisoResponse>.Exitoso(_mapper.Map<NivelPermisoResponse>(nivel));
    }

    public async Task<Result<NivelPermisoResponse>> ActualizarAsync(Guid id, CrearNivelPermisoRequest request, CancellationToken ct)
    {
        NivelPermiso? nivel = await _repository.ObtenerNivelPermisoPorIdAsync(id, ct);
        if (nivel is null)
            throw new EntidadNoEncontradaException(nameof(NivelPermiso), id);

        nivel.Codigo = request.Codigo;
        nivel.Nombre = request.Nombre;
        nivel.Orden = request.Orden;
        await _repository.SaveChangesAsync(ct);

        return Result<NivelPermisoResponse>.Exitoso(_mapper.Map<NivelPermisoResponse>(nivel));
    }

    public async Task<Result<bool>> EliminarAsync(Guid id, CancellationToken ct)
    {
        NivelPermiso? nivel = await _repository.ObtenerNivelPermisoPorIdAsync(id, ct);
        if (nivel is null)
            throw new EntidadNoEncontradaException(nameof(NivelPermiso), id);

        nivel.Estado = false;
        await _repository.SaveChangesAsync(ct);
        
        return Result<bool>.Exitoso(true);
    }
}
