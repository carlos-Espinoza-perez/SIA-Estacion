namespace Sia.Domain.Excepciones;

public class EntidadNoEncontradaException : Exception
{
    public string NombreEntidad { get; }
    public object Identificador { get; }

    public EntidadNoEncontradaException(string nombreEntidad, object identificador)
        : base($"La entidad '{nombreEntidad}' con identificador '{identificador}' no fue encontrada.")
    {
        NombreEntidad = nombreEntidad;
        Identificador = identificador;
    }
}
