namespace Sia.Domain.Enums;

// Determina si la estacion opera en modo control de acceso (identificacion de
// personas) o en modo prestamo de items (biblioteca / equipo de laboratorio).
// El firmware de la pantalla usa este valor para decidir que flujo mostrar.
public enum TipoRecursoEstacion
{
    ControlAcceso,
    EquipoLaboratorio,
    MaterialBibliografico
}
