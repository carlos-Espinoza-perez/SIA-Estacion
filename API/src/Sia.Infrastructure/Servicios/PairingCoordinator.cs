using System.Collections.Concurrent;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Estaciones;

namespace Sia.Infrastructure.Servicios;

public class PairingCoordinator : IPairingCoordinator
{
    private readonly ConcurrentDictionary<string, TaskCompletionSource<ConfiguracionEstacionProvisionadaResponse>> _esperas = new();
    private readonly ConcurrentDictionary<string, (ConfiguracionEstacionProvisionadaResponse Config, DateTimeOffset Expira)> _pendientes = new();

    public async Task<ConfiguracionEstacionProvisionadaResponse?> EsperarConfiguracionAsync(
        string identificador, TimeSpan timeout, CancellationToken ct)
    {
        string clave = NormalizarClave(identificador);
        if (string.IsNullOrEmpty(clave)) return null;

        LimpiarExpirados();

        // Si ya había una configuración entregada en los últimos 60 segundos, responder de inmediato
        if (_pendientes.TryRemove(clave, out var pendiente) && pendiente.Expira > DateTimeOffset.UtcNow)
        {
            return pendiente.Config;
        }

        var tcs = _esperas.GetOrAdd(clave, _ => new TaskCompletionSource<ConfiguracionEstacionProvisionadaResponse>(
            TaskCreationOptions.RunContinuationsAsynchronously));

        using var ctsTimeout = new CancellationTokenSource(timeout);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, ctsTimeout.Token);

        try
        {
            using (linkedCts.Token.Register(() => tcs.TrySetCanceled(linkedCts.Token)))
            {
                return await tcs.Task;
            }
        }
        catch (OperationCanceledException)
        {
            // Timeout alcanzado o petición abortada por el cliente
            return null;
        }
        finally
        {
            _esperas.TryRemove(clave, out _);
        }
    }

    public bool NotificarVinculacion(string identificador, ConfiguracionEstacionProvisionadaResponse configuracion)
    {
        string clave = NormalizarClave(identificador);
        if (string.IsNullOrEmpty(clave)) return false;

        // Guardamos en buffer temporal por 60 segundos por si el dispositivo reconecta
        _pendientes[clave] = (configuracion, DateTimeOffset.UtcNow.AddMinutes(1));

        if (_esperas.TryRemove(clave, out var tcs))
        {
            return tcs.TrySetResult(configuracion);
        }

        return true;
    }

    private static string NormalizarClave(string valor) => valor?.Trim().ToUpperInvariant() ?? string.Empty;

    private void LimpiarExpirados()
    {
        var ahora = DateTimeOffset.UtcNow;
        foreach (var kvp in _pendientes)
        {
            if (kvp.Value.Expira <= ahora)
            {
                _pendientes.TryRemove(kvp.Key, out _);
            }
        }
    }
}
