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
                Descripcion = CrearDescripcion(entry.Entity, accion),
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

    private static string CrearDescripcion(object entidad, string accion)
    {
        if (entidad is Persona persona)
        {
            string nombrePersona = $"{persona.Nombres} {persona.Apellidos}".Trim();
            return accion switch
            {
                "Crear" => $"Se registró a {nombrePersona}",
                "Actualizar" => $"Se actualizaron los datos de {nombrePersona}",
                "Inactivar" => $"Se desactivó a {nombrePersona}",
                "Activar" => $"Se activó a {nombrePersona}",
                "Eliminar" => $"Se eliminó a {nombrePersona}",
                _ => $"Se modificó a {nombrePersona}"
            };
        }

        string nombre = entidad switch
        {
            FotoReferencia => "una fotografía de referencia",
            Item item => $"el ítem {item.Nombre}",
            Estacion estacion => $"la estación {estacion.Nombre}",
            TipoItem tipoItem => $"el tipo de ítem {tipoItem.Nombre}",
            _ => NombreEntidad(entidad.GetType().Name)
        };

        return (accion, entidad) switch
        {
            ("Crear", FotoReferencia) => "Se agregó una fotografía de referencia",
            ("Inactivar", FotoReferencia) => "Se eliminó una fotografía de referencia",
            ("Crear", _) => $"Se creó {nombre}",
            ("Actualizar", _) => $"Se actualizó {nombre}",
            ("Inactivar", _) => $"Se desactivó {nombre}",
            ("Activar", _) => $"Se activó {nombre}",
            ("Eliminar", _) => $"Se eliminó {nombre}",
            _ => $"Se modificó {nombre}"
        };
    }

    private static string NombreEntidad(string entidad) => entidad switch
    {
        "Persona" => "una persona",
        "Usuario" => "un usuario",
        "Item" => "un ítem",
        "Estacion" => "una estación",
        "TipoItem" => "un tipo de ítem",
        "FotoReferencia" => "una fotografía de referencia",
        "ApplicationRole" => "un rol",
        "Empresa" => "la empresa",
        "AtributoDefinicion" => "un atributo de ítem",
        "EstacionTipoItem" => "la asignación de un tipo de ítem a una estación",
        "ItemAtributoValor" => "un valor de atributo de ítem",
        "ItemComposicion" => "la composición de un ítem",
        "NivelPermiso" => "un nivel de permiso",
        "OperacionItem" => "una operación de préstamo",
        "OperacionItemDetalle" => "el detalle de una operación",
        "Privilegio" => "un privilegio",
        "RolPrivilegio" => "la asignación de un privilegio a un rol",
        _ => entidad
    };
}
