using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Sia.Application.Configuracion;
using Sia.Application.Abstracciones;
using FaceONNX;
using System.Drawing;

namespace Sia.Infrastructure.Servicios;

public class ServicioReconocimientoFacial : IServicioReconocimientoFacial, IDisposable
{
    private readonly ReconocimientoOpciones _opciones;
    private readonly ILogger<ServicioReconocimientoFacial> _logger;
    private readonly FaceDetector _faceDetector;
    private readonly FaceEmbedder _faceEmbedder;

    public ServicioReconocimientoFacial(IOptions<ReconocimientoOpciones> opciones, ILogger<ServicioReconocimientoFacial> logger)
    {
        _opciones = opciones.Value;
        _logger = logger;
        
        string modelosRuta = Path.Combine(Directory.GetCurrentDirectory(), _opciones.RutaModelos);
        if (!Directory.Exists(modelosRuta))
        {
            Directory.CreateDirectory(modelosRuta);
            _logger.LogWarning("El directorio de modelos FaceONNX no existía y fue creado en: {Ruta}. Se requieren los modelos .onnx.", modelosRuta);
        }

        // En un entorno de producción, los modelos .onnx deben estar en _opciones.RutaModelos
        // Para que FaceONNX funcione sin errores, debe encontrar los archivos allí.
        try 
        {
            // FaceONNX busca los modelos en la carpeta de ejecución por defecto si no están instanciados explícitamente.
            // Para simplificar la inyección, si los archivos no existen, la librería podría tirar excepción.
            // Asumimos que los archivos (version-RFB-320.onnx y resnet100.onnx) están descargados o se descargarán.
            _faceDetector = new FaceDetector(0.95f, 0.5f, 0.5f);
            _faceEmbedder = new FaceEmbedder();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inicializar FaceONNX. ¿Faltan los archivos de modelo en el directorio de ejecución?");
            throw;
        }
    }

    public async Task<bool> SonLaMismaPersonaAsync(byte[] foto1, byte[] foto2, CancellationToken ct = default)
    {
        try
        {
            using var cancelSource = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cancelSource.CancelAfter(_opciones.TimeoutMs);

            return await Task.Run(() => 
            {
                using var ms1 = new MemoryStream(foto1);
                using var ms2 = new MemoryStream(foto2);
                using var image1 = new Bitmap(ms1);
                using var image2 = new Bitmap(ms2);

                var faces1 = _faceDetector.Forward(image1);
                var faces2 = _faceDetector.Forward(image2);

                if (faces1.Length == 0 || faces2.Length == 0)
                {
                    _logger.LogWarning("No se detectaron rostros en una o ambas imágenes.");
                    return false;
                }

                var face1 = faces1.OrderByDescending(f => f.Score).First();
                var face2 = faces2.OrderByDescending(f => f.Score).First();

                // En FaceONNX 4.x, FaceDetector devuelve un Rectangle (o estructura similar con ubicación).
                // Se debe recortar el rostro antes de pasarlo al FaceEmbedder.
                Rectangle rect1 = face1.Rectangle;
                Rectangle rect2 = face2.Rectangle;
                
                // Asegurar que el rectángulo esté dentro de los límites
                rect1.Intersect(new Rectangle(0, 0, image1.Width, image1.Height));
                rect2.Intersect(new Rectangle(0, 0, image2.Width, image2.Height));

                using var crop1 = image1.Clone(rect1, image1.PixelFormat);
                using var crop2 = image2.Clone(rect2, image2.PixelFormat);

                var embedding1 = _faceEmbedder.Forward(crop1);
                var embedding2 = _faceEmbedder.Forward(crop2);

                // Calcular similitud coseno
                float dot = 0f, mag1 = 0f, mag2 = 0f;
                for (int i = 0; i < embedding1.Length; i++)
                {
                    dot += embedding1[i] * embedding2[i];
                    mag1 += embedding1[i] * embedding1[i];
                    mag2 += embedding2[i] * embedding2[i];
                }

                double similarity = dot / (Math.Sqrt(mag1) * Math.Sqrt(mag2));

                _logger.LogDebug("Similitud calculada: {Similitud}. Umbral: {Umbral}", similarity, _opciones.UmbralSimilitud);
                return similarity >= _opciones.UmbralSimilitud;
            }, cancelSource.Token);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("El reconocimiento facial excedió el tiempo límite de {Timeout}ms.", _opciones.TimeoutMs);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando imágenes con FaceONNX.");
            return false;
        }
    }

    public void Dispose()
    {
        _faceDetector?.Dispose();
        _faceEmbedder?.Dispose();
        GC.SuppressFinalize(this);
    }
}
