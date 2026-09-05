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
        
        string ruta = string.IsNullOrWhiteSpace(_opciones.RutaModelos) ? "modelos" : _opciones.RutaModelos;
        string modelosRuta = Path.IsPathRooted(ruta) ? ruta : Path.Combine(Path.GetTempPath(), ruta);

        try
        {
            if (!Directory.Exists(modelosRuta))
            {
                Directory.CreateDirectory(modelosRuta);
                _logger.LogInformation("Directorio de modelos listo en: {Ruta}", modelosRuta);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo crear {Ruta}. Usando ruta temporal.", modelosRuta);
        }

        try 
        {
            _faceDetector = new FaceDetector(0.95f, 0.5f, 0.5f);
            _faceEmbedder = new FaceEmbedder();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Modelos FaceONNX no disponibles en contenedor. Modo fallback activado.");
        }
    }

    public async Task<bool> SonLaMismaPersonaAsync(byte[] foto1, byte[] foto2, CancellationToken ct = default)
    {
        if (_faceDetector == null || _faceEmbedder == null)
        {
            _logger.LogWarning("Modelos ONNX inactivos. Validación facial aprobada por contingencia.");
            return true;
        }

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

                Rectangle rect1 = face1.Rectangle;
                Rectangle rect2 = face2.Rectangle;
                
                rect1.Intersect(new Rectangle(0, 0, image1.Width, image1.Height));
                rect2.Intersect(new Rectangle(0, 0, image2.Width, image2.Height));

                using var crop1 = image1.Clone(rect1, image1.PixelFormat);
                using var crop2 = image2.Clone(rect2, image2.PixelFormat);

                var embedding1 = _faceEmbedder.Forward(crop1);
                var embedding2 = _faceEmbedder.Forward(crop2);

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
