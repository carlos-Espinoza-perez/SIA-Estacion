using AutoMapper;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioEmpresas
{
    private readonly IEmpresasRepository _repository;
    private readonly IMapper _mapper;

    public ServicioEmpresas(IEmpresasRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<List<EmpresaResponse>>> ObtenerTodasAsync(CancellationToken ct)
    {
        List<Empresa> empresas = await _repository.ObtenerTodasAsync(ct);
        return Result<List<EmpresaResponse>>.Exitoso(_mapper.Map<List<EmpresaResponse>>(empresas));
    }

    public async Task<Result<EmpresaResponse>> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Empresa? empresa = await _repository.ObtenerPorIdAsync(id, ct);
        if (empresa is null)
            throw new EntidadNoEncontradaException(nameof(Empresa), id);

        return Result<EmpresaResponse>.Exitoso(_mapper.Map<EmpresaResponse>(empresa));
    }

    public async Task<Result<EmpresaResponse>> CrearAsync(CrearEmpresaRequest request, CancellationToken ct)
    {
        var empresa = _mapper.Map<Empresa>(request);
        empresa.Id = Guid.NewGuid();

        await _repository.AgregarAsync(empresa, ct);
        await _repository.SaveChangesAsync(ct);

        return Result<EmpresaResponse>.Exitoso(_mapper.Map<EmpresaResponse>(empresa));
    }

    public async Task<Result<EmpresaResponse>> ActualizarAsync(Guid id, ActualizarEmpresaRequest request, CancellationToken ct)
    {
        Empresa? empresa = await _repository.ObtenerPorIdAsync(id, ct);
        if (empresa is null)
            throw new EntidadNoEncontradaException(nameof(Empresa), id);

        empresa.Nombre = request.Nombre;
        await _repository.SaveChangesAsync(ct);

        return Result<EmpresaResponse>.Exitoso(_mapper.Map<EmpresaResponse>(empresa));
    }

    public async Task<Result<bool>> EliminarAsync(Guid id, CancellationToken ct)
    {
        Empresa? empresa = await _repository.ObtenerPorIdAsync(id, ct);
        if (empresa is null)
            throw new EntidadNoEncontradaException(nameof(Empresa), id);

        empresa.Estado = false;
        await _repository.SaveChangesAsync(ct);
        
        return Result<bool>.Exitoso(true);
    }
}
