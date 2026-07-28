namespace Sia.Application.Dtos.Comunes;

public class RespuestaEnvuelta<T>
{
    public T? Datos { get; set; }
    public List<ErrorDto>? Errores { get; set; }
    public PaginacionMetadata? Paginacion { get; set; }

    public static RespuestaEnvuelta<T> Exitosa(T datos) => new() { Datos = datos };

    public static RespuestaEnvuelta<T> ConPaginacion(T datos, PaginacionMetadata paginacion) =>
        new() { Datos = datos, Paginacion = paginacion };

    public static RespuestaEnvuelta<T> ConError(string codigo, string mensaje) =>
        new() { Errores = [new ErrorDto(codigo, mensaje)] };
}
