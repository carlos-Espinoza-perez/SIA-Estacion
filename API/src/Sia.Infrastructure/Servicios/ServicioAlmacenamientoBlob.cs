using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Options;
using Sia.Application.Abstracciones;
using Sia.Application.Configuracion;

namespace Sia.Infrastructure.Servicios;

public class ServicioAlmacenamientoBlob : IServicioAlmacenamiento
{
    private readonly AlmacenamientoOpciones _opciones;
    private readonly BlobServiceClient _blobServiceClient;
    private readonly BlobContainerClient _containerClient;

    public ServicioAlmacenamientoBlob(IOptions<AlmacenamientoOpciones> opciones)
    {
        _opciones = opciones.Value;
        _blobServiceClient = new BlobServiceClient(_opciones.ConnectionString);
        _containerClient = _blobServiceClient.GetBlobContainerClient(_opciones.Contenedor);
        
        // Ensure container exists
        _containerClient.CreateIfNotExists(PublicAccessType.None);
    }

    public async Task<string> SubirArchivoAsync(Stream contenido, string nombreArchivo, string contentType, CancellationToken cancellationToken = default)
    {
        BlobClient blobClient = _containerClient.GetBlobClient(nombreArchivo);

        var blobUploadOptions = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        };

        await blobClient.UploadAsync(contenido, blobUploadOptions, cancellationToken);
        
        return nombreArchivo;
    }

    public async Task EliminarArchivoAsync(string ruta, CancellationToken cancellationToken = default)
    {
        BlobClient blobClient = _containerClient.GetBlobClient(ruta);
        await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, null, cancellationToken);
    }

    public Task<string> ObtenerUrlFirmadaAsync(string ruta, CancellationToken cancellationToken = default)
    {
        BlobClient blobClient = _containerClient.GetBlobClient(ruta);

        if (!blobClient.CanGenerateSasUri)
        {
            throw new InvalidOperationException("BlobClient must be authorized with Shared Key credentials to create a SAS URI.");
        }

        BlobSasBuilder sasBuilder = new BlobSasBuilder()
        {
            BlobContainerName = blobClient.BlobContainerName,
            BlobName = blobClient.Name,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow,
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_opciones.UrlFirmadaMinutos)
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        Uri sasUri = blobClient.GenerateSasUri(sasBuilder);
        
        return Task.FromResult(sasUri.ToString());
    }

    public async Task<byte[]> DescargarArchivoAsync(string ruta, CancellationToken cancellationToken = default)
    {
        BlobClient blobClient = _containerClient.GetBlobClient(ruta);
        
        using var ms = new MemoryStream();
        await blobClient.DownloadToAsync(ms, cancellationToken);
        return ms.ToArray();
    }
}
