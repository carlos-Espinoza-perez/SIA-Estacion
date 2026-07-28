using Microsoft.Extensions.Options;
using Sia.Application.Configuracion;
using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Servicios;

public class ServicioAlmacenamientoLocal : IServicioAlmacenamiento
{
    private readonly AlmacenamientoOpciones _opciones;
    private readonly string _rutaCompleta;

    public ServicioAlmacenamientoLocal(IOptions<AlmacenamientoOpciones> opciones)
    {
        _opciones = opciones.Value;
        _rutaCompleta = Path.Combine(Directory.GetCurrentDirectory(), _opciones.RutaBase, _opciones.Contenedor);
        
        if (!Directory.Exists(_rutaCompleta))
        {
            Directory.CreateDirectory(_rutaCompleta);
        }
    }

    public async Task<string> SubirArchivoAsync(Stream contenido, string nombreArchivo, string contentType, CancellationToken ct = default)
    {
        string rutaArchivo = Path.Combine(_rutaCompleta, nombreArchivo);
        string directorio = Path.GetDirectoryName(rutaArchivo)!;
        
        if (!Directory.Exists(directorio))
        {
            Directory.CreateDirectory(directorio);
        }

        using var fileStream = new FileStream(rutaArchivo, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await contenido.CopyToAsync(fileStream, ct);

        // Retornamos la ruta relativa para ser servida por archivos estáticos, por ejemplo
        return Path.Combine(_opciones.RutaBase, _opciones.Contenedor, nombreArchivo).Replace("\\", "/");
    }

    public Task<string> ObtenerUrlFirmadaAsync(string ruta, CancellationToken ct = default)
    {
        // En un almacenamiento local para desarrollo, la ruta devuelta por SubirArchivoAsync es suficiente
        // (asumiendo que UseStaticFiles está configurado para servir esta ruta)
        // Agregamos un timestamp para forzar actualización de caché (simulando firma básica)
        long ticks = DateTime.UtcNow.Ticks;
        string separador = ruta.Contains("?") ? "&" : "?";
        return Task.FromResult($"/{ruta}{separador}v={ticks}");
    }

    public Task EliminarArchivoAsync(string ruta, CancellationToken ct = default)
    {
        string rutaRelativa = ruta.StartsWith("/") ? ruta[1..] : ruta; // Quitar '/' inicial si existe
        string rutaArchivo = Path.Combine(Directory.GetCurrentDirectory(), rutaRelativa);
        
        if (File.Exists(rutaArchivo))
        {
            File.Delete(rutaArchivo);
        }
        
        return Task.CompletedTask;
    }

    public async Task<byte[]> DescargarArchivoAsync(string ruta, CancellationToken cancellationToken = default)
    {
        string fileName = Path.GetFileName(ruta.Split('?')[0]); 
        // ruta incluye /uploads/fotos/..., por lo que en local extraemos el fileName o la ruta relativa.
        string rutaRelativa = ruta.StartsWith("/") ? ruta[1..] : ruta;
        string pathReal = Path.Combine(Directory.GetCurrentDirectory(), rutaRelativa);
        
        if (File.Exists(pathReal))
        {
            return await File.ReadAllBytesAsync(pathReal, cancellationToken);
        }
        
        throw new FileNotFoundException("El archivo solicitado no se encontró en el almacenamiento local.", pathReal);
    }
}
