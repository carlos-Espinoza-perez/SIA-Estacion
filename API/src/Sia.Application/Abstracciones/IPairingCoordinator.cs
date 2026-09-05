using Sia.Application.Dtos.Estaciones;

namespace Sia.Application.Abstracciones;

public interface IPairingCoordinator
{
    Task<ConfiguracionEstacionProvisionadaResponse?> EsperarConfiguracionAsync(string identificador, TimeSpan timeout, CancellationToken ct);
    bool NotificarVinculacion(string identificador, ConfiguracionEstacionProvisionadaResponse configuracion);
}
