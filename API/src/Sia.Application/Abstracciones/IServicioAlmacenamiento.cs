namespace Sia.Application.Abstracciones;

public interface IServicioAlmacenamiento
{
    Task<string> SubirArchivoAsync(Stream contenido, string nombreArchivo, string contentType, CancellationToken cancellationToken = default);
    Task EliminarArchivoAsync(string ruta, CancellationToken cancellationToken = default);
    Task<string> ObtenerUrlFirmadaAsync(string ruta, CancellationToken cancellationToken = default);
    Task<byte[]> DescargarArchivoAsync(string ruta, CancellationToken cancellationToken = default);
}
