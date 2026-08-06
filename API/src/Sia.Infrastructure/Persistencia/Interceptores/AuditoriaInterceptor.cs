using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Sia.Application.Abstracciones;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Interceptores;

public class AuditoriaInterceptor : SaveChangesInterceptor
{
    private readonly IContextoUsuario _contextoUsuario;
    private readonly IContextoEmpresa _contextoEmpresa;

    public AuditoriaInterceptor(IContextoUsuario contextoUsuario, IContextoEmpresa contextoEmpresa)
    {
        _contextoUsuario = contextoUsuario;
        _contextoEmpresa = contextoEmpresa;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        DbContext? dbContext = eventData.Context;
        if (dbContext is null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        var entries = dbContext.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .ToList();

        var auditorias = new List<AuditoriaCambio>();
        Guid? empresaId = _contextoEmpresa.EmpresaId == Guid.Empty ? null : _contextoEmpresa.EmpresaId;

        // Si no hay empresaId en el contexto actual, quizás es un flujo del sistema sin tenant
        if (empresaId is null && _contextoUsuario.EmpresaId.HasValue)
        {
            empresaId = _contextoUsuario.EmpresaId.Value;
        }

        foreach (var entry in entries)
        {
            if (entry.Entity is AuditoriaCambio || entry.Entity is EventoAcceso || entry.Entity is OperacionMovimiento)
                continue; // No auditar tablas de log

            string accion = entry.State switch
            {
                EntityState.Added => "Crear",
                EntityState.Modified => "Actualizar",
                EntityState.Deleted => "Eliminar",
                _ => "Desconocido"
            };

            // Detectar soft-delete (estado modificado pero propiedad Estado = false)
            if (entry.State == EntityState.Modified)
            {
                var estadoProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Estado");
                if (estadoProp != null && estadoProp.IsModified)
                {
                    bool estadoNuevo = (bool)(estadoProp.CurrentValue ?? true);
                    bool estadoViejo = (bool)(estadoProp.OriginalValue ?? true);
                    
                    if (estadoViejo && !estadoNuevo)
                    {
                        accion = "Inactivar";
                    }
                    else if (!estadoViejo && estadoNuevo)
                    {
                        accion = "Activar";
                    }
                }
            }

            var idProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Id");
            Guid entidadId = idProp?.CurrentValue is Guid g ? g : Guid.Empty;

            // Intentar extraer EmpresaId de la entidad si es que no lo tenemos en el contexto
            if (empresaId is null)
            {
                var empProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "EmpresaId");
                if (empProp?.CurrentValue is Guid eg && eg != Guid.Empty)
                    empresaId = eg;
            }

            // Ignorar entidades globales (no tienen EmpresaId)
            if (empresaId is null || empresaId == Guid.Empty) continue;

            string nombreEntidad = entry.Entity.GetType().Name;
            auditorias.Add(new AuditoriaCambio
            {
                Id = Guid.NewGuid(),
                EmpresaId = empresaId.Value,
                Entidad = nombreEntidad,
                EntidadId = entidadId,
                Accion = accion,
                Descripcion = $"{accion} de {nombreEntidad} #{entidadId}",
                Origen = "Panel",
                UserId = _contextoUsuario.UserId,
                FechaHora = DateTimeOffset.UtcNow
            });
        }

        if (auditorias.Count > 0)
        {
            dbContext.AddRange(auditorias);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
