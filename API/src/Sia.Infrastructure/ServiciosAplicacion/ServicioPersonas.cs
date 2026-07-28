using System.Security.Cryptography;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Personas;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioPersonas
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;
    private readonly IServicioAlmacenamiento _almacenamiento;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioPersonas(SiaDbContext db, IMapper mapper, IServicioAlmacenamiento almacenamiento, IContextoEmpresa contextoEmpresa)
    {
        _db = db;
        _mapper = mapper;
        _almacenamiento = almacenamiento;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<List<PersonaResponse>> ObtenerTodasAsync(string? busqueda, string? tipo, CancellationToken ct)
    {
        IQueryable<Persona> query = _db.Personas.Include(p => p.FotosReferencia);

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(p => p.Nombres.Contains(busqueda) || p.Apellidos.Contains(busqueda) || p.CodigoEstudiantil.Contains(busqueda));

        if (!string.IsNullOrWhiteSpace(tipo) && Enum.TryParse<TipoPersona>(tipo, out TipoPersona tp))
            query = query.Where(p => p.TipoPersona == tp);

        List<Persona> personas = await query.Where(p => p.Estado).OrderBy(p => p.Apellidos).ToListAsync(ct);
        return _mapper.Map<List<PersonaResponse>>(personas);
    }

    public async Task<PersonaDetalleResponse> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        Persona persona = await _db.Personas
            .Include(p => p.FotosReferencia)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Persona), id);

        PersonaDetalleResponse response = _mapper.Map<PersonaDetalleResponse>(persona);
        FotoReferencia? fotoActiva = persona.FotosReferencia.FirstOrDefault(f => f.Estado);
        if (fotoActiva is not null)
            response.FotoReferencia = _mapper.Map<FotoReferenciaResponse>(fotoActiva);

        return response;
    }

    public async Task<PersonaResponse> ObtenerPorCodigoAsync(string codigo, CancellationToken ct)
    {
        Persona persona = await _db.Personas
            .Include(p => p.FotosReferencia)
            .FirstOrDefaultAsync(p => p.CodigoEstudiantil == codigo, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Persona), codigo);

        return _mapper.Map<PersonaResponse>(persona);
    }

    public async Task<PersonaResponse> CrearAsync(CrearPersonaRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<TipoPersona>(request.TipoPersona, out TipoPersona tp))
            throw new ReglaNegocioException("TIPO_PERSONA_INVALIDO", $"Tipo de persona '{request.TipoPersona}' no válido.");

        var persona = new Persona
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            CodigoEstudiantil = request.CodigoEstudiantil,
            Nombres = request.Nombres,
            Apellidos = request.Apellidos,
            TipoPersona = tp
        };

        _db.Personas.Add(persona);
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<PersonaResponse>(persona);
    }

    public async Task<PersonaResponse> ActualizarAsync(Guid id, ActualizarPersonaRequest request, CancellationToken ct)
    {
        Persona persona = await _db.Personas.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(Persona), id);

        if (!Enum.TryParse<TipoPersona>(request.TipoPersona, out TipoPersona tp))
            throw new ReglaNegocioException("TIPO_PERSONA_INVALIDO", $"Tipo de persona '{request.TipoPersona}' no válido.");

        persona.Nombres = request.Nombres;
        persona.Apellidos = request.Apellidos;
        persona.TipoPersona = tp;
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<PersonaResponse>(persona);
    }

    public async Task EliminarAsync(Guid id, CancellationToken ct)
    {
        Persona persona = await _db.Personas.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(Persona), id);

        persona.Estado = false;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<FotoReferenciaResponse> SubirFotoAsync(Guid personaId, Stream contenido, string contentType, CancellationToken ct)
    {
        Persona persona = await _db.Personas.FindAsync([personaId], ct)
            ?? throw new EntidadNoEncontradaException(nameof(Persona), personaId);

        FotoReferencia? fotoAnterior = await _db.FotosReferencia.FirstOrDefaultAsync(f => f.PersonaId == personaId && f.Estado, ct);
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

        _db.FotosReferencia.Add(foto);
        await _db.SaveChangesAsync(ct);

        return _mapper.Map<FotoReferenciaResponse>(foto);
    }

    public async Task<string> ObtenerUrlFotoAsync(Guid personaId, CancellationToken ct)
    {
        FotoReferencia foto = await _db.FotosReferencia
            .FirstOrDefaultAsync(f => f.PersonaId == personaId && f.Estado, ct)
            ?? throw new EntidadNoEncontradaException("FotoReferencia", personaId);

        return await _almacenamiento.ObtenerUrlFirmadaAsync(foto.Url, ct);
    }

    public async Task EliminarFotoAsync(Guid personaId, CancellationToken ct)
    {
        FotoReferencia foto = await _db.FotosReferencia
            .FirstOrDefaultAsync(f => f.PersonaId == personaId && f.Estado, ct)
            ?? throw new EntidadNoEncontradaException("FotoReferencia", personaId);

        foto.Estado = false;
        foto.FechaEliminacion = DateTimeOffset.UtcNow;
        await _almacenamiento.EliminarArchivoAsync(foto.Url, ct);
        await _db.SaveChangesAsync(ct);
    }

    private static string ObtenerExtension(string contentType) => contentType switch
    {
        "image/jpeg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        _ => ".bin"
    };
}
