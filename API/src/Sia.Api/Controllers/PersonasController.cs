using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sia.Api.Filtros;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Personas;
using Sia.Application.Servicios;

namespace Sia.Api.Controllers;

[ApiController]
[Route("api/personas")]
[Authorize]
public class PersonasController : SiaControllerBase
{
    private readonly ServicioPersonas _servicio;

    public PersonasController(ServicioPersonas servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerTodas([FromQuery] string? busqueda, [FromQuery] string? tipo, [FromQuery] string? rol, [FromQuery] string? estado, [FromQuery] int pagina = 1, [FromQuery] int limite = 10, CancellationToken ct = default)
    {
        var resultado = await _servicio.ObtenerTodasAsync(busqueda, tipo, rol, estado, pagina, limite, ct);
        return HandleResult(resultado);
    }

    [HttpGet("{id:guid}")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorIdAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpGet("codigo/{codigo}")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerPorCodigo(string codigo, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerPorCodigoAsync(codigo, ct);
        return HandleResult(resultado);
    }

    [HttpPost]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Crear([FromBody] CrearPersonaRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.CrearAsync(request, ct);
        return HandleResult(resultado);
    }

    [HttpPut("{id:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarPersonaRequest request, CancellationToken ct)
    {
        var resultado = await _servicio.ActualizarAsync(id, request, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpPost("{id:guid}/foto")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> SubirFoto(Guid id, [FromForm] IFormFile? foto, [FromForm] List<IFormFile>? fotos, CancellationToken ct)
    {
        var archivos = new List<IFormFile>();
        if (foto is not null)
            archivos.Add(foto);
        if (fotos is not null)
            archivos.AddRange(fotos);

        archivos = archivos.Where(archivo => archivo.Length > 0).ToList();

        if (archivos.Count == 0)
            return BadRequest(RespuestaEnvuelta<object>.ConError("FOTO_REQUERIDA", "Se requiere un archivo de foto."));

        if (archivos.Count == 1)
        {
            await using Stream stream = archivos[0].OpenReadStream();
            var resultado = await _servicio.SubirFotoAsync(id, stream, archivos[0].ContentType, ct);
            return HandleResult(resultado);
        }

        var fotosReferencia = new List<ArchivoFotoReferencia>();
        foreach (IFormFile archivo in archivos)
        {
            var memoria = new MemoryStream();
            await archivo.CopyToAsync(memoria, ct);
            memoria.Position = 0;
            fotosReferencia.Add(new ArchivoFotoReferencia(memoria, archivo.ContentType));
        }

        try
        {
            var resultado = await _servicio.SubirFotosAsync(id, fotosReferencia, ct);
            return HandleResult(resultado);
        }
        finally
        {
            foreach (ArchivoFotoReferencia archivo in fotosReferencia)
            {
                await archivo.Contenido.DisposeAsync();
            }
        }
    }

    [HttpGet("{id:guid}/foto")]
    [RequierePrivilegio("PER", "L")]
    public async Task<IActionResult> ObtenerUrlFoto(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.ObtenerUrlFotoAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}/foto")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> EliminarFoto(Guid id, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarFotoAsync(id, ct);
        return HandleResult(resultado);
    }

    [HttpDelete("{id:guid}/fotos/{fotoId:guid}")]
    [RequierePrivilegio("PER", "E")]
    public async Task<IActionResult> EliminarFoto(Guid id, Guid fotoId, CancellationToken ct)
    {
        var resultado = await _servicio.EliminarFotoAsync(id, fotoId, ct);
        return HandleResult(resultado);
    }
}
