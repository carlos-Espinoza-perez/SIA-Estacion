using Microsoft.Extensions.Logging;
using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Servicios;

// Implementacion de respaldo usada cuando el ensamblado FaceONNX no esta presente en el
// despliegue (se excluye del paquete en Azure App Service F1 por su tamano, ver
// .github/workflows/deploy-azure.yml). A proposito NO referencia ningun tipo de FaceONNX
// ni de System.Drawing: si esos tipos se referenciaran aqui, el CLR intentaria cargar el
// ensamblado igual al resolver esta clase y volveria a fallar con FileNotFoundException,
// incluso dentro de un try/catch (la carga del ensamblado ocurre en la resolucion de tipos,
// no se puede interceptar con manejo de excepciones en el mismo punto).
public class ServicioReconocimientoFacialNoDisponible : IServicioReconocimientoFacial
{
    private readonly ILogger<ServicioReconocimientoFacialNoDisponible> _logger;

    public ServicioReconocimientoFacialNoDisponible(ILogger<ServicioReconocimientoFacialNoDisponible> logger)
    {
        _logger = logger;
    }

    public Task<bool> SonLaMismaPersonaAsync(byte[] foto1, byte[] foto2, CancellationToken ct = default)
    {
        _logger.LogWarning("Reconocimiento facial no disponible en este despliegue (FaceONNX.dll ausente). Validacion aprobada por contingencia.");
        return Task.FromResult(true);
    }
}
