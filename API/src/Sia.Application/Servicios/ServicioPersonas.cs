using System.Security.Cryptography;
using AutoMapper;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Personas;
using Sia.Application.Resultados;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioPersonas
{
    private readonly IPersonasRepository _repository;
    private readonly IMapper _mapper;
    private readonly IServicioAlmacenamiento _almacenamiento;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioPersonas(IPersonasRepository repository, IMapper mapper, IServicioAlmacenamiento almacenamiento, IContextoEmpresa contextoEmpresa)
    {
        _repository = repository;
        _mapper = mapper;
        _almacenamiento = almacenamiento;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<Result<List<PersonaResponse>>> ObtenerTodasAsync(string? busqueda, string? tipo, string? rol, string? estadoStr, int pagina, int limite, CancellationToken ct)
    {
        TipoPersona? tp = null;
        bool isPersonal = false;
        if (!string.IsNullOrWhiteSpace(tipo))
        {
            if (tipo.Equals("Estudiante", StringComparison.OrdinalIgnoreCase))
                tp = TipoPersona.Estudiante;
            else if (tipo.Equals("Personal", StringComparison.OrdinalIgnoreCase))
                isPersonal = true;
        }

        bool? estado = null;
        if (!string.IsNullOrWhiteSpace(estadoStr))
        {
            if (estadoStr.Equals("Activo", StringComparison.OrdinalIgnoreCase))
                estado = true;
            else if (estadoStr.Equals("Inactivo", StringComparison.OrdinalIgnoreCase))
                estado = false;
        }

        int totalRegistros = await _repository.ContarPersonasAsync(busqueda, tp, isPersonal, rol, estado, ct);
        List<Persona> personas = await _repository.ObtenerTodasAsync(busqueda, tp, isPersonal, rol, estado, pagina, limite, ct);
        
        var paginacion = new Sia.Application.Dtos.Comunes.PaginacionMetadata
        {
            PaginaActual = pagina,
            TamanoPagina = limite,
            TotalRegistros = totalRegistros,
            TotalPaginas = (int)Math.Ceiling(totalRegistros / (double)limite)
        };

        return Result<List<PersonaResponse>>.ExitosoConPaginacion(_mapper.Map<List<PersonaResponse>>(personas), paginacion);
    }

    public async Task<Result<PersonaDetalleResponse>> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Persona? persona = await _repository.ObtenerPorIdAsync(id, ct);
        if (persona is null)
            throw new EntidadNoEncontradaException(nameof(Persona), id);

        PersonaDetalleResponse response = _mapper.Map<PersonaDetalleResponse>(persona);
        FotoReferencia? fotoActiva = persona.FotosReferencia.FirstOrDefault(f => f.Estado);
        if (fotoActiva is not null)
            response.FotoReferencia = _mapper.Map<FotoReferenciaResponse>(fotoActiva);

        return Result<PersonaDetalleResponse>.Exitoso(response);
    }

    public async Task<Result<PersonaResponse>> ObtenerPorCodigoAsync(string codigo, CancellationToken ct)
    {
        Persona? persona = await _repository.ObtenerPorCodigoAsync(codigo, ct);
        if (persona is null)
            throw new EntidadNoEncontradaException(nameof(Persona), codigo);

        return Result<PersonaResponse>.Exitoso(_mapper.Map<PersonaResponse>(persona));
    }

    public async Task<Result<PersonaResponse>> CrearAsync(CrearPersonaRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<TipoPersona>(request.TipoPersona, out TipoPersona tp))
            return Result<PersonaResponse>.Fallido("TIPO_PERSONA_INVALIDO", $"Tipo de persona '{request.TipoPersona}' no válido.");

        var persona = new Persona
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            CodigoEstudiantil = request.CodigoEstudiantil,
            Nombres = request.Nombres,
            Apellidos = request.Apellidos,
            TipoPersona = tp,
            CarreraOArea = request.CarreraOArea,
            Correo = request.Correo,
            Telefono = request.Telefono
        };

        await _repository.AgregarAsync(persona, ct);
        await _repository.SaveChangesAsync(ct);

        return Result<PersonaResponse>.Exitoso(_mapper.Map<PersonaResponse>(persona));
    }

    public async Task<Result<PersonaResponse>> ActualizarAsync(Guid id, ActualizarPersonaRequest request, CancellationToken ct)
    {
        Persona? persona = await _repository.ObtenerPorIdAsync(id, ct);
        if (persona is null)
            throw new EntidadNoEncontradaException(nameof(Persona), id);

        if (!Enum.TryParse<TipoPersona>(request.TipoPersona, out TipoPersona tp))
            return Result<PersonaResponse>.Fallido("TIPO_PERSONA_INVALIDO", $"Tipo de persona '{request.TipoPersona}' no válido.");

        persona.Nombres = request.Nombres;
        persona.Apellidos = request.Apellidos;
        persona.TipoPersona = tp;
        persona.CarreraOArea = request.CarreraOArea;
        persona.Correo = request.Correo;
        persona.Telefono = request.Telefono;
        await _repository.SaveChangesAsync(ct);

        return Result<PersonaResponse>.Exitoso(_mapper.Map<PersonaResponse>(persona));
    }

    public async Task<Result<bool>> EliminarAsync(Guid id, CancellationToken ct)
    {
        Persona? persona = await _repository.ObtenerPorIdAsync(id, ct);
        if (persona is null)
            throw new EntidadNoEncontradaException(nameof(Persona), id);

        persona.Estado = false;
        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<FotoReferenciaResponse>> SubirFotoAsync(Guid personaId, Stream contenido, string contentType, CancellationToken ct)
    {
        Persona? persona = await _repository.ObtenerPorIdAsync(personaId, ct);
        if (persona is null)
            throw new EntidadNoEncontradaException(nameof(Persona), personaId);

        FotoReferencia? fotoAnterior = await _repository.ObtenerFotoActivaAsync(personaId, ct);
        if (fotoAnterior is not null)
        {
            fotoAnterior.Estado = false;
            fotoAnterior.FechaEliminacion = DateTimeOffset.UtcNow;
        }

        using var hashStream = new MemoryStream();
        await contenido.CopyToAsync(hashStream, ct);
        hashStream.Position = 0;
        byte[] hashBytes = SHA256.HashData(hashStream.ToArray());
        string hashContenido = Convert.ToBase64String(hashBytes);

        hashStream.Position = 0;
        string nombreArchivo = $"{personaId}/{Guid.NewGuid()}{ObtenerExtension(contentType)}";
        string url = await _almacenamiento.SubirArchivoAsync(hashStream, nombreArchivo, contentType, ct);

        var foto = new FotoReferencia
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            PersonaId = personaId,
            Url = url,
            HashContenido = hashContenido
        };

        await _repository.AgregarFotoAsync(foto, ct);
        await _repository.SaveChangesAsync(ct);

        return Result<FotoReferenciaResponse>.Exitoso(_mapper.Map<FotoReferenciaResponse>(foto));
    }

    public async Task<Result<string>> ObtenerUrlFotoAsync(Guid personaId, CancellationToken ct)
    {
        FotoReferencia? foto = await _repository.ObtenerFotoActivaAsync(personaId, ct);
        if (foto is null)
            throw new EntidadNoEncontradaException("FotoReferencia", personaId);

        string url = await _almacenamiento.ObtenerUrlFirmadaAsync(foto.Url, ct);
        return Result<string>.Exitoso(url);
    }

    public async Task<Result<bool>> EliminarFotoAsync(Guid personaId, CancellationToken ct)
    {
        FotoReferencia? foto = await _repository.ObtenerFotoActivaAsync(personaId, ct);
        if (foto is null)
            throw new EntidadNoEncontradaException("FotoReferencia", personaId);

        foto.Estado = false;
        foto.FechaEliminacion = DateTimeOffset.UtcNow;
        await _almacenamiento.EliminarArchivoAsync(foto.Url, ct);
        await _repository.SaveChangesAsync(ct);
        
        return Result<bool>.Exitoso(true);
    }

    private static string ObtenerExtension(string contentType) => contentType switch
    {
        "image/jpeg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        _ => ".bin"
    };
}
