using System.ComponentModel.DataAnnotations;

namespace Sia.Application.Configuracion;

public class ReconocimientoOpciones
{
    public const string Seccion = "Reconocimiento";

    public double UmbralSimilitud { get; set; } = 0.6;
    [Required] public string RutaModelos { get; set; } = string.Empty;
    public int TimeoutMs { get; set; } = 5000;
}
