namespace Sia.Application.Resultados;

public class Result<T>
{
    public T? Valor { get; }
    public Error? Error { get; }
    public bool EsExitoso => Error is null;
    public Sia.Application.Dtos.Comunes.PaginacionMetadata? Paginacion { get; }

    private Result(T valor, Sia.Application.Dtos.Comunes.PaginacionMetadata? paginacion = null)
    {
        Valor = valor;
        Paginacion = paginacion;
    }

    private Result(Error error)
    {
        Error = error;
    }

    public static Result<T> Exitoso(T valor) => new(valor);
    public static Result<T> ExitosoConPaginacion(T valor, Sia.Application.Dtos.Comunes.PaginacionMetadata paginacion) => new(valor, paginacion);
    public static Result<T> Fallido(Error error) => new(error);
    public static Result<T> Fallido(string codigo, string mensaje) => new(new Error(codigo, mensaje));
}
