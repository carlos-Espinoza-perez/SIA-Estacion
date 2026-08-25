using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Sia.Domain.Excepciones;

namespace Sia.Api.Middleware;

public class ManejadorExcepcionesMiddleware
{
    private readonly RequestDelegate _siguiente;
    private readonly ILogger<ManejadorExcepcionesMiddleware> _logger;

    public ManejadorExcepcionesMiddleware(RequestDelegate siguiente, ILogger<ManejadorExcepcionesMiddleware> logger)
    {
        _siguiente = siguiente;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _siguiente(contexto);
        }
        catch (EntidadNoEncontradaException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status404NotFound;
            await EscribirProblemDetails(contexto, "Recurso no encontrado", ex.Message, StatusCodes.Status404NotFound);
        }
        catch (ReglaNegocioException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
            await EscribirProblemDetails(contexto, "Regla de negocio violada", ex.Message, StatusCodes.Status422UnprocessableEntity, ex.Codigo);
        }
        catch (ConflictoConcurrenciaException ex)
        {
            contexto.Response.StatusCode = StatusCodes.Status409Conflict;
            await EscribirProblemDetails(contexto, "Conflicto de concurrencia", ex.Message, StatusCodes.Status409Conflict, ex.Codigo);
        }
        catch (Exception ex)
        {
            string correlacionId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "Error no controlado. Correlación: {CorrelacionId}", correlacionId);

            contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await EscribirProblemDetails(
                contexto,
                "Error interno",
                $"Ocurrió un error inesperado. Referencia: {correlacionId} Detalles: {ex.Message} {ex.StackTrace}",
                StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task EscribirProblemDetails(HttpContext contexto, string titulo, string detalle, int status, string? codigoNegocio = null)
    {
        var problemDetails = new ProblemDetails
        {
            Title = titulo,
            Detail = detalle,
            Status = status,
            Instance = contexto.Request.Path
        };

        if (codigoNegocio is not null)
        {
            problemDetails.Extensions["codigoError"] = codigoNegocio;
        }

        contexto.Response.ContentType = "application/problem+json";
        await contexto.Response.WriteAsJsonAsync(problemDetails);
    }
}
