namespace Sia.Application.Resultados;

public class Result<T>
{
    public T? Valor { get; }
    public Error? Error { get; }
    public bool EsExitoso => Error is null;

    private Result(T valor)
    {
        Valor = valor;
    }

    private Result(Error error)
    {
        Error = error;
    }

    public static Result<T> Exitoso(T valor) => new(valor);
    public static Result<T> Fallido(Error error) => new(error);
    public static Result<T> Fallido(string codigo, string mensaje) => new(new Error(codigo, mensaje));
}
