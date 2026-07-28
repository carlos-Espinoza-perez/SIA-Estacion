using Sia.Domain.Enums;

namespace Sia.Domain.Constantes;

public static class TransicionesOperacion
{
    private static readonly Dictionary<EstadoOperacionItem, HashSet<EstadoOperacionItem>> TransicionesValidas = new()
    {
        [EstadoOperacionItem.Pendiente] = [EstadoOperacionItem.Aprobado, EstadoOperacionItem.Rechazado],
        [EstadoOperacionItem.Aprobado] = [EstadoOperacionItem.Entregado, EstadoOperacionItem.Rechazado],
        [EstadoOperacionItem.Entregado] = [EstadoOperacionItem.Devuelto, EstadoOperacionItem.DevueltoParcial],
    };

    public static bool EsValida(EstadoOperacionItem estadoActual, EstadoOperacionItem estadoNuevo)
    {
        return TransicionesValidas.TryGetValue(estadoActual, out HashSet<EstadoOperacionItem>? permitidos)
            && permitidos.Contains(estadoNuevo);
    }
}
