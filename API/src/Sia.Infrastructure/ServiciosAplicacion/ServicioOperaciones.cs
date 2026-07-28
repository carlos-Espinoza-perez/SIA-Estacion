using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Operaciones;
using Sia.Domain.Constantes;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Domain.Excepciones;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioOperaciones
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;
    private readonly IContextoEmpresa _contextoEmpresa;
    private readonly IContextoUsuario _contextoUsuario;

    public ServicioOperaciones(SiaDbContext db, IMapper mapper, IContextoEmpresa contextoEmpresa, IContextoUsuario contextoUsuario)
    {
        _db = db;
        _mapper = mapper;
        _contextoEmpresa = contextoEmpresa;
        _contextoUsuario = contextoUsuario;
    }

    public async Task<OperacionDetalleResponse> ObtenerPorIdAsync(Guid id, CancellationToken ct)
    {
        OperacionItem operacion = await _db.OperacionesItem
            .Include(o => o.ItemEscaneado)
            .Include(o => o.Persona)
            .Include(o => o.Detalles).ThenInclude(d => d.Item)
            .Include(o => o.Movimientos).ThenInclude(m => m.RegistradoPorPersona)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(OperacionItem), id);

        var response = new OperacionDetalleResponse
        {
            Id = operacion.Id,
            ItemEscaneadoId = operacion.ItemEscaneadoId,
            ItemNombre = operacion.ItemEscaneado.Nombre,
            PersonaId = operacion.PersonaId,
            PersonaNombre = $"{operacion.Persona.Nombres} {operacion.Persona.Apellidos}",
            TipoOperacion = operacion.TipoOperacion.ToString(),
            EstadoActual = operacion.EstadoActual.ToString(),
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

        return response;
    }

    public async Task<OperacionResponse> CrearOperacionAsync(CrearOperacionRequest request, CancellationToken ct)
    {
        Item item = await _db.Items
            .Include(i => i.ComponentesDe)
            .FirstOrDefaultAsync(i => i.Id == request.ItemEscaneadoId, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Item), request.ItemEscaneadoId);

        if (item.EstadoActual != EstadoItem.Disponible)
            throw new ReglaNegocioException("ITEM_NO_DISPONIBLE", $"El ítem se encuentra en estado {item.EstadoActual}");

        var operacion = new OperacionItem
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            ItemEscaneadoId = item.Id,
            PersonaId = request.PersonaId,
            EstacionId = request.EstacionId,
            TipoOperacion = TipoOperacionItem.Prestamo,
            EstadoActual = EstadoOperacionItem.Aprobado, // Asumimos pre-aprobado para este flujo
            FechaSolicitud = DateTimeOffset.UtcNow,
            FechaCompromisoDevolucion = request.FechaCompromisoDevolucion
        };

        // Cambiar estado del agrupador
        item.EstadoActual = EstadoItem.Prestado;

        // Crear detalle para el ítem principal
        _db.OperacionItemDetalles.Add(new OperacionItemDetalle
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            OperacionItemId = operacion.Id,
            ItemId = item.Id
        });

        // Crear detalle y cambiar estado de componentes si es agrupador
        if (item.EsAgrupador)
        {
            foreach (var comp in item.ComponentesDe)
            {
                Item componente = await _db.Items.FindAsync([comp.ItemComponenteId], ct) ?? throw new Exception("Componente no encontrado.");
                componente.EstadoActual = EstadoItem.Prestado;

                _db.OperacionItemDetalles.Add(new OperacionItemDetalle
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = _contextoEmpresa.EmpresaId,
                    OperacionItemId = operacion.Id,
                    ItemId = componente.Id
                });
            }
        }

        RegistrarMovimiento(operacion, EstadoOperacionItem.Aprobado, EstadoOperacionItem.Aprobado, "Operación creada");

        _db.OperacionesItem.Add(operacion);
        await _db.SaveChangesAsync(ct);

        return new OperacionResponse
        {
            Id = operacion.Id,
            ItemEscaneadoId = operacion.ItemEscaneadoId,
            PersonaId = operacion.PersonaId,
            EstadoActual = operacion.EstadoActual.ToString()
        };
    }

    public async Task<OperacionResponse> DevolverAsync(Guid operacionId, DevolverRequest request, CancellationToken ct)
    {
        OperacionItem operacion = await _db.OperacionesItem
            .Include(o => o.Detalles).ThenInclude(d => d.Item)
            .FirstOrDefaultAsync(o => o.Id == operacionId, ct)
            ?? throw new EntidadNoEncontradaException(nameof(OperacionItem), operacionId);

        EstadoOperacionItem estadoAnterior = operacion.EstadoActual;

        // La validación de transiciones centralizada
        if (!TransicionesOperacion.EsValida(estadoAnterior, EstadoOperacionItem.Entregado))
            throw new ReglaNegocioException("TRANSICION_INVALIDA", $"No se puede devolver desde el estado {estadoAnterior}");

        foreach (DevolucionDetalleRequest detReq in request.Detalles)
        {
            OperacionItemDetalle? detalle = operacion.Detalles.FirstOrDefault(d => d.Id == detReq.DetalleId);
            if (detalle == null || detalle.FechaDevolucion.HasValue) continue;

            if (!Enum.TryParse<CondicionDevolucion>(detReq.CondicionDevolucion, out CondicionDevolucion condicion))
                throw new ReglaNegocioException("CONDICION_INVALIDA", $"Condición '{detReq.CondicionDevolucion}' inválida.");

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

        RegistrarMovimiento(operacion, estadoAnterior, estadoNuevo, "Devolución registrada");

        await _db.SaveChangesAsync(ct);

        return new OperacionResponse
        {
            Id = operacion.Id,
            ItemEscaneadoId = operacion.ItemEscaneadoId,
            PersonaId = operacion.PersonaId,
            EstadoActual = operacion.EstadoActual.ToString()
        };
    }

    private void RegistrarMovimiento(OperacionItem operacion, EstadoOperacionItem estadoAnterior, EstadoOperacionItem estadoNuevo, string observacion)
    {
        _db.OperacionMovimientos.Add(new OperacionMovimiento
        {
            Id = Guid.NewGuid(),
            EmpresaId = operacion.EmpresaId,
            OperacionItemId = operacion.Id,
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = estadoNuevo,
            RegistradoPorPersonaId = _contextoUsuario.PersonaId, // Guid de la persona logueada
            FechaHora = DateTimeOffset.UtcNow,
            Observacion = observacion
        });
    }
}
