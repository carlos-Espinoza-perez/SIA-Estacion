using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        catch (DbUpdateConcurrencyException ex)
        {
            string correlacionId = Guid.NewGuid().ToString();
            _logger.LogWarning(ex, "Conflicto de concurrencia en base de datos. Correlación: {CorrelacionId}", correlacionId);

            contexto.Response.StatusCode = StatusCodes.Status409Conflict;
            await EscribirProblemDetails(
                contexto,
                "Conflicto de concurrencia",
                "El registro fue modificado por otra persona mientras se procesaba esta solicitud. Actualiza la página e inténtalo de nuevo.",
                StatusCodes.Status409Conflict);
        }
        catch (DbUpdateException ex)
        {
            string correlacionId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "Error al guardar en base de datos. Correlación: {CorrelacionId}", correlacionId);

            contexto.Response.StatusCode = StatusCodes.Status409Conflict;
            await EscribirProblemDetails(
                contexto,
                "No se pudo guardar el cambio",
                $"El dato no cumple una regla de la base de datos (por ejemplo, un valor duplicado). Referencia: {correlacionId}",
                StatusCodes.Status409Conflict);
        }
        catch (Exception ex)
        {
            string correlacionId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "Error no controlado. Correlación: {CorrelacionId}", correlacionId);

            contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await EscribirProblemDetails(
                contexto,
                "Error interno",
                $"Ocurrió un error inesperado. Referencia: {correlacionId}",
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
