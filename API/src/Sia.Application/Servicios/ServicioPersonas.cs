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
            else if (Enum.TryParse<TipoPersona>(tipo, true, out var parsedTp))
                tp = parsedTp;
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

        List<PersonaResponse> respuesta = _mapper.Map<List<PersonaResponse>>(personas);
        var userIds = personas.Where(p => !string.IsNullOrEmpty(p.UserId)).Select(p => p.UserId!).Distinct().ToList();
        var rolesMap = userIds.Count > 0 ? await _repository.ObtenerRolesPorUserIdsAsync(userIds, ct) : new Dictionary<string, string>();

        for (int indice = 0; indice < personas.Count; indice++)
        {
            var p = personas[indice];
            respuesta[indice].UserId = p.UserId;

            if (!string.IsNullOrEmpty(p.UserId) && rolesMap.TryGetValue(p.UserId, out var rolNombre))
            {
                respuesta[indice].Rol = rolNombre;
            }
            else
            {
                respuesta[indice].Rol = p.TipoPersona == TipoPersona.Estudiante ? "Estudiante" : (p.TipoPersona == TipoPersona.Administrador ? "Administrador Global" : p.TipoPersona.ToString());
            }

            FotoReferencia? fotoPrincipal = p.FotosReferencia
                .Where(foto => foto.Estado)
                .OrderByDescending(foto => foto.FechaCarga)
                .FirstOrDefault();

            if (fotoPrincipal is not null)
                respuesta[indice].AvatarUrl = await _almacenamiento.ObtenerUrlFirmadaAsync(fotoPrincipal.Url, ct);
        }

        return Result<List<PersonaResponse>>.ExitosoConPaginacion(respuesta, paginacion);
    }

    public async Task<Result<PersonaDetalleResponse>> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Persona? persona = await _repository.ObtenerPorIdAsync(id, ct);
        if (persona is null)
            throw new EntidadNoEncontradaException(nameof(Persona), id);

        PersonaDetalleResponse response = _mapper.Map<PersonaDetalleResponse>(persona);
        if (!string.IsNullOrEmpty(persona.UserId))
        {
            var rolesMap = await _repository.ObtenerRolesPorUserIdsAsync([persona.UserId], ct);
            if (rolesMap.TryGetValue(persona.UserId, out var rolNombre))
                response.Rol = rolNombre;
            else
                response.Rol = persona.TipoPersona.ToString();
        }
        else
        {
            response.Rol = persona.TipoPersona == TipoPersona.Estudiante ? "Estudiante" : persona.TipoPersona.ToString();
        }

        List<FotoReferencia> fotosActivas = persona.FotosReferencia
            .Where(f => f.Estado)
            .OrderByDescending(f => f.FechaCarga)
            .ToList();

        response.FotosReferencia = [];
        foreach (FotoReferencia foto in fotosActivas)
        {
            response.FotosReferencia.Add(await MapearFotoConUrlFirmadaAsync(foto, ct));
        }

        response.FotoReferencia = response.FotosReferencia.FirstOrDefault();

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
        TipoPersona tp = TipoPersona.Estudiante;
        if (!string.IsNullOrWhiteSpace(request.TipoPersona))
        {
            if (request.TipoPersona.Equals("Personal", StringComparison.OrdinalIgnoreCase))
                tp = TipoPersona.Encargado;
            else if (Enum.TryParse<TipoPersona>(request.TipoPersona, true, out TipoPersona parsedTp))
                tp = parsedTp;
            else
                return Result<PersonaResponse>.Fallido("TIPO_PERSONA_INVALIDO", $"Tipo de persona '{request.TipoPersona}' no válido.");
        }

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

        TipoPersona tp = persona.TipoPersona;
        if (!string.IsNullOrWhiteSpace(request.TipoPersona))
        {
            if (request.TipoPersona.Equals("Personal", StringComparison.OrdinalIgnoreCase))
                tp = TipoPersona.Encargado;
            else if (Enum.TryParse<TipoPersona>(request.TipoPersona, true, out TipoPersona parsedTp))
                tp = parsedTp;
            else
                return Result<PersonaResponse>.Fallido("TIPO_PERSONA_INVALIDO", $"Tipo de persona '{request.TipoPersona}' no válido.");
        }

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

        return Result<FotoReferenciaResponse>.Exitoso(await MapearFotoConUrlFirmadaAsync(foto, ct));
    }

    public async Task<Result<List<FotoReferenciaResponse>>> SubirFotosAsync(Guid personaId, IReadOnlyCollection<ArchivoFotoReferencia> archivos, CancellationToken ct)
    {
        if (archivos.Count == 0)
            return Result<List<FotoReferenciaResponse>>.Fallido("FOTO_REQUERIDA", "Se requiere al menos un archivo de foto.");

        var fotos = new List<FotoReferenciaResponse>();
        foreach (ArchivoFotoReferencia archivo in archivos)
        {
            Result<FotoReferenciaResponse> resultado = await SubirFotoAsync(personaId, archivo.Contenido, archivo.ContentType, ct);
            if (!resultado.EsExitoso)
                return Result<List<FotoReferenciaResponse>>.Fallido(resultado.Error!.Codigo, resultado.Error.Mensaje);

            fotos.Add(resultado.Valor!);
        }

        return Result<List<FotoReferenciaResponse>>.Exitoso(fotos);
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
        return await EliminarFotoAsync(personaId, foto, ct);
    }

    public async Task<Result<bool>> EliminarFotoAsync(Guid personaId, Guid fotoId, CancellationToken ct)
    {
        FotoReferencia? foto = await _repository.ObtenerFotoActivaAsync(personaId, fotoId, ct);
        return await EliminarFotoAsync(personaId, foto, ct);
    }

    private async Task<Result<bool>> EliminarFotoAsync(Guid personaId, FotoReferencia? foto, CancellationToken ct)
    {
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
        "image/avif" => ".avif",
        _ => ".bin"
    };

    private async Task<FotoReferenciaResponse> MapearFotoConUrlFirmadaAsync(FotoReferencia foto, CancellationToken ct)
    {
        FotoReferenciaResponse response = _mapper.Map<FotoReferenciaResponse>(foto);
        response.Url = await _almacenamiento.ObtenerUrlFirmadaAsync(foto.Url, ct);
        return response;
    }
}

public sealed record ArchivoFotoReferencia(Stream Contenido, string ContentType);
