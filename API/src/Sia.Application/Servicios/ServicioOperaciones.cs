using AutoMapper;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Operaciones;
using Sia.Application.Resultados;
using Sia.Domain.Constantes;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioOperaciones
{
    private readonly IOperacionesRepository _repository;
    private readonly IMapper _mapper;
    private readonly IContextoEmpresa _contextoEmpresa;
    private readonly IContextoUsuario _contextoUsuario;

    public ServicioOperaciones(IOperacionesRepository repository, IMapper mapper, IContextoEmpresa contextoEmpresa, IContextoUsuario contextoUsuario)
    {
        _repository = repository;
        _mapper = mapper;
        _contextoEmpresa = contextoEmpresa;
        _contextoUsuario = contextoUsuario;
    }

    public async Task<Result<List<OperacionResponse>>> ObtenerTodasAsync(string? busqueda, string? estado, Guid? estacionId, Guid? personaId, CancellationToken ct)
    {
        var operaciones = await _repository.ObtenerTodasAsync(busqueda, estado, estacionId, personaId, ct);
        var responses = operaciones.Select(MapearOperacionResponse).ToList();
        return Result<List<OperacionResponse>>.Exitoso(responses);
    }

    public async Task<Result<OperacionResponse>> AprobarAsync(Guid id, string? observacion, CancellationToken ct)
    {
        var operacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (operacion is null)
            throw new EntidadNoEncontradaException(nameof(OperacionItem), id);

        var estadoAnterior = operacion.EstadoActual;
        if (!TransicionesOperacion.EsValida(estadoAnterior, EstadoOperacionItem.Aprobado))
            return Result<OperacionResponse>.Fallido("TRANSICION_INVALIDA", $"No se puede aprobar una operación en estado {estadoAnterior}");

        operacion.EstadoActual = EstadoOperacionItem.Aprobado;
        await RegistrarMovimiento(operacion, estadoAnterior, EstadoOperacionItem.Aprobado, observacion ?? "Operación aprobada", ct);
        await _repository.SaveChangesAsync(ct);

        return Result<OperacionResponse>.Exitoso(MapearOperacionResponse(operacion));
    }

    public async Task<Result<OperacionResponse>> RechazarAsync(Guid id, string? observacion, CancellationToken ct)
    {
        var operacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (operacion is null)
            throw new EntidadNoEncontradaException(nameof(OperacionItem), id);

        var estadoAnterior = operacion.EstadoActual;
        if (!TransicionesOperacion.EsValida(estadoAnterior, EstadoOperacionItem.Rechazado))
            return Result<OperacionResponse>.Fallido("TRANSICION_INVALIDA", $"No se puede rechazar una operación en estado {estadoAnterior}");

        operacion.EstadoActual = EstadoOperacionItem.Rechazado;
        if (operacion.ItemEscaneado != null)
        {
            operacion.ItemEscaneado.EstadoActual = EstadoItem.Disponible;
        }

        await RegistrarMovimiento(operacion, estadoAnterior, EstadoOperacionItem.Rechazado, observacion ?? "Operación rechazada", ct);
        await _repository.SaveChangesAsync(ct);

        return Result<OperacionResponse>.Exitoso(MapearOperacionResponse(operacion));
    }

    public async Task<Result<OperacionResponse>> EntregarAsync(Guid id, string? observacion, CancellationToken ct)
    {
        var operacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (operacion is null)
            throw new EntidadNoEncontradaException(nameof(OperacionItem), id);

        var estadoAnterior = operacion.EstadoActual;
        if (!TransicionesOperacion.EsValida(estadoAnterior, EstadoOperacionItem.Entregado))
            return Result<OperacionResponse>.Fallido("TRANSICION_INVALIDA", $"No se puede entregar una operación en estado {estadoAnterior}");

        operacion.EstadoActual = EstadoOperacionItem.Entregado;
        await RegistrarMovimiento(operacion, estadoAnterior, EstadoOperacionItem.Entregado, observacion ?? "Ítem entregado al solicitante", ct);
        await _repository.SaveChangesAsync(ct);

        return Result<OperacionResponse>.Exitoso(MapearOperacionResponse(operacion));
    }

    private static OperacionResponse MapearOperacionResponse(OperacionItem o) => new()
    {
        Id = o.Id,
        Folio = o.Folio,
        ItemEscaneadoId = o.ItemEscaneadoId,
        ItemNombre = o.ItemEscaneado?.Nombre ?? string.Empty,
        PersonaId = o.PersonaId,
        PersonaNombre = o.Persona != null ? $"{o.Persona.Nombres} {o.Persona.Apellidos}".Trim() : string.Empty,
        CodigoEstudiantil = o.Persona?.CodigoEstudiantil ?? string.Empty,
        EstacionId = o.EstacionId,
        EstacionNombre = o.Estacion?.Nombre ?? "Estación principal",
        TipoOperacion = o.TipoOperacion.ToString(),
        EstadoActual = o.EstadoActual.ToString(),
        Flujo = o.Estacion != null && o.Estacion.RequiereAprobacion ? "Aprobación" : "Directo",
        Observaciones = o.Observaciones,
        FechaSolicitud = o.FechaSolicitud,
        FechaCompromisoDevolucion = o.FechaCompromisoDevolucion,
        FechaDevolucion = o.FechaDevolucion
    };

    public async Task<Result<OperacionDetalleResponse>> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        OperacionItem? operacion = await _repository.ObtenerPorIdAsync(id, ct);
        if (operacion is null)
            throw new EntidadNoEncontradaException(nameof(OperacionItem), id);

        var response = new OperacionDetalleResponse
        {
            Id = operacion.Id,
            Folio = operacion.Folio,
            ItemEscaneadoId = operacion.ItemEscaneadoId,
            ItemNombre = operacion.ItemEscaneado.Nombre,
            PersonaId = operacion.PersonaId,
            PersonaNombre = $"{operacion.Persona.Nombres} {operacion.Persona.Apellidos}",
            TipoOperacion = operacion.TipoOperacion.ToString(),
            EstadoActual = operacion.EstadoActual.ToString(),
            Observaciones = operacion.Observaciones,
            FechaSolicitud = operacion.FechaSolicitud,
            FechaCompromisoDevolucion = operacion.FechaCompromisoDevolucion,
            FechaDevolucion = operacion.FechaDevolucion,
            Detalles = operacion.Detalles.Select(d => new DetalleItemResponse
            {
                Id = d.Id,
                ItemId = d.ItemId,
                ItemNombre = d.Item.Nombre,
                CondicionDevolucion = d.CondicionDevolucion?.ToString(),
                FechaDevolucion = d.FechaDevolucion,
                Observacion = d.Observacion
            }).ToList(),
            Movimientos = operacion.Movimientos.OrderByDescending(m => m.FechaHora).Select(m => new MovimientoResponse
            {
                Id = m.Id,
                EstadoAnterior = m.EstadoAnterior.ToString(),
                EstadoNuevo = m.EstadoNuevo.ToString(),
                RegistradoPor = m.RegistradoPorPersona != null ? $"{m.RegistradoPorPersona.Nombres} {m.RegistradoPorPersona.Apellidos}" : "Sistema",
                FechaHora = m.FechaHora,
                Observacion = m.Observacion
            }).ToList()
        };

        return Result<OperacionDetalleResponse>.Exitoso(response);
    }

    public async Task<Result<OperacionResponse>> CrearOperacionAsync(CrearOperacionRequest request, CancellationToken ct)
    {
        Item? item = await _repository.ObtenerItemConComponentesAsync(request.ItemEscaneadoId, ct);
        if (item is null)
            throw new EntidadNoEncontradaException(nameof(Item), request.ItemEscaneadoId);

        if (item.EstadoActual != EstadoItem.Disponible)
            return Result<OperacionResponse>.Fallido("ITEM_NO_DISPONIBLE", $"El ítem se encuentra en estado {item.EstadoActual}");

        string folio = $"OP-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpperInvariant()}";

        var operacion = new OperacionItem
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            Folio = folio,
            ItemEscaneadoId = item.Id,
            PersonaId = request.PersonaId,
            EstacionId = request.EstacionId,
            TipoOperacion = TipoOperacionItem.Prestamo,
            EstadoActual = EstadoOperacionItem.Aprobado, // Asumimos pre-aprobado para este flujo
            Observaciones = request.Observaciones,
            FechaSolicitud = DateTimeOffset.UtcNow,
            FechaCompromisoDevolucion = request.FechaCompromisoDevolucion
        };

        // Cambiar estado del agrupador
        item.EstadoActual = EstadoItem.Prestado;

        // Crear detalle para el ítem principal
        await _repository.AgregarOperacionDetalleAsync(new OperacionItemDetalle
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            OperacionItemId = operacion.Id,
            ItemId = item.Id
        }, ct);

        // Crear detalle y cambiar estado de componentes si es agrupador
        if (item.EsAgrupador)
        {
            foreach (var comp in item.ComponentesDe)
            {
                Item? componente = await _repository.ObtenerItemBasicoAsync(comp.ItemComponenteId, ct);
                if (componente is null)
                    throw new EntidadNoEncontradaException(nameof(Item), comp.ItemComponenteId);
                
                componente.EstadoActual = EstadoItem.Prestado;

                await _repository.AgregarOperacionDetalleAsync(new OperacionItemDetalle
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = _contextoEmpresa.EmpresaId,
                    OperacionItemId = operacion.Id,
                    ItemId = componente.Id
                }, ct);
            }
        }

        await RegistrarMovimiento(operacion, EstadoOperacionItem.Aprobado, EstadoOperacionItem.Aprobado, "Operación creada", ct);

        await _repository.AgregarOperacionAsync(operacion, ct);
        await _repository.SaveChangesAsync(ct);

        return Result<OperacionResponse>.Exitoso(new OperacionResponse
        {
            Id = operacion.Id,
            Folio = operacion.Folio,
            ItemEscaneadoId = operacion.ItemEscaneadoId,
            ItemNombre = item.Nombre,
            PersonaId = operacion.PersonaId,
            TipoOperacion = operacion.TipoOperacion.ToString(),
            EstadoActual = operacion.EstadoActual.ToString(),
            Observaciones = operacion.Observaciones,
            FechaSolicitud = operacion.FechaSolicitud,
            FechaCompromisoDevolucion = operacion.FechaCompromisoDevolucion
        });
    }

    public async Task<Result<OperacionResponse>> DevolverAsync(Guid operacionId, DevolverRequest request, CancellationToken ct)
    {
        OperacionItem? operacion = await _repository.ObtenerPorIdAsync(operacionId, ct);
        if (operacion is null)
            throw new EntidadNoEncontradaException(nameof(OperacionItem), operacionId);

        EstadoOperacionItem estadoAnterior = operacion.EstadoActual;

        // La validación de transiciones centralizada
        if (!TransicionesOperacion.EsValida(estadoAnterior, EstadoOperacionItem.Entregado))
            return Result<OperacionResponse>.Fallido("TRANSICION_INVALIDA", $"No se puede devolver desde el estado {estadoAnterior}");

        foreach (DevolucionDetalleRequest detReq in request.Detalles)
        {
            OperacionItemDetalle? detalle = operacion.Detalles.FirstOrDefault(d => d.Id == detReq.DetalleId);
            if (detalle == null || detalle.FechaDevolucion.HasValue) continue;

            if (!Enum.TryParse<CondicionDevolucion>(detReq.CondicionDevolucion, out CondicionDevolucion condicion))
                return Result<OperacionResponse>.Fallido("CONDICION_INVALIDA", $"Condición '{detReq.CondicionDevolucion}' inválida.");

            detalle.CondicionDevolucion = condicion;
            detalle.Observacion = detReq.Observacion;
            detalle.FechaDevolucion = DateTimeOffset.UtcNow;

            // Actualizar estado del ítem basado en la condición
            detalle.Item.EstadoActual = condicion switch
            {
                CondicionDevolucion.Bueno => EstadoItem.Disponible,
                CondicionDevolucion.Danado => EstadoItem.Mantenimiento,
                CondicionDevolucion.NoDevuelto => EstadoItem.Perdido,
                _ => EstadoItem.Disponible
            };
        }

        bool devolucionCompleta = operacion.Detalles.All(d => d.FechaDevolucion.HasValue);
        
        EstadoOperacionItem estadoNuevo = devolucionCompleta ? EstadoOperacionItem.Devuelto : EstadoOperacionItem.DevueltoParcial;
        operacion.EstadoActual = estadoNuevo;
        
        if (devolucionCompleta)
        {
            operacion.FechaDevolucion = DateTimeOffset.UtcNow;
            
            // Si el ítem es agrupador y fue devuelto parcialmente en diferentes partes,
            // verificar si todo el kit está devuelto para marcar el agrupador como Disponible
            Item agrupador = operacion.Detalles.First(d => d.ItemId == operacion.ItemEscaneadoId).Item;
            if (agrupador.EsAgrupador && operacion.Detalles.All(d => d.CondicionDevolucion == CondicionDevolucion.Bueno))
            {
                agrupador.EstadoActual = EstadoItem.Disponible;
            }
        }

        await RegistrarMovimiento(operacion, estadoAnterior, estadoNuevo, "Devolución registrada", ct);

        await _repository.SaveChangesAsync(ct);

        return Result<OperacionResponse>.Exitoso(new OperacionResponse
        {
            Id = operacion.Id,
            Folio = operacion.Folio,
            ItemEscaneadoId = operacion.ItemEscaneadoId,
            ItemNombre = operacion.ItemEscaneado?.Nombre ?? string.Empty,
            PersonaId = operacion.PersonaId,
            PersonaNombre = operacion.Persona != null ? $"{operacion.Persona.Nombres} {operacion.Persona.Apellidos}" : string.Empty,
            TipoOperacion = operacion.TipoOperacion.ToString(),
            EstadoActual = operacion.EstadoActual.ToString(),
            Observaciones = operacion.Observaciones,
            FechaSolicitud = operacion.FechaSolicitud,
            FechaCompromisoDevolucion = operacion.FechaCompromisoDevolucion,
            FechaDevolucion = operacion.FechaDevolucion
        });
    }

    private async Task RegistrarMovimiento(OperacionItem operacion, EstadoOperacionItem estadoAnterior, EstadoOperacionItem estadoNuevo, string observacion, CancellationToken ct)
    {
        await _repository.AgregarMovimientoAsync(new OperacionMovimiento
        {
            Id = Guid.NewGuid(),
            EmpresaId = operacion.EmpresaId,
            OperacionItemId = operacion.Id,
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = estadoNuevo,
            RegistradoPorPersonaId = _contextoUsuario.PersonaId, // Guid de la persona logueada
            FechaHora = DateTimeOffset.UtcNow,
            Observacion = observacion
        }, ct);
    }
}
