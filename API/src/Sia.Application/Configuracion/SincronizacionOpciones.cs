using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Configuracion;

public class SincronizacionOpciones
{
    public const string Seccion = "Sincronizacion";

    public int TamanoLote { get; set; } = 100;
    public int IntervaloHeartbeatSegundos { get; set; } = 30;
}
