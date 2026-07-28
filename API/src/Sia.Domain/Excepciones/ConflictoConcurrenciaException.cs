namespace Sia.Domain.Excepciones;

public class ConflictoConcurrenciaException : Exception
{
    public string Codigo { get; }

    public ConflictoConcurrenciaException(string codigo, string mensaje)
        : base(mensaje)
    {
        Codigo = codigo;
    }
}
