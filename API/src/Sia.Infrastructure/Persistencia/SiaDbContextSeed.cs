using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Infrastructure.Persistencia;

public static class SiaDbContextSeed
{
    public static async Task SeedAsync(
        SiaDbContext context,
        UserManager<IdentityUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        // Empresa inicial
        var empresa = await context.Empresas.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.Codigo == "123456789");
        if (empresa == null)
        {
            empresa = new Empresa
            {
                Id = Guid.NewGuid(),
                Nombre = "SIA Central",
                Codigo = "123456789",
                Estado = true
            };
            context.Empresas.Add(empresa);
            await context.SaveChangesAsync();
        }

        // Roles del sistema
        const string rolAdmin = "Administrador General";
        var rolesPermitidos = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            rolAdmin,
            "Docente",
            "Estudiante"
        };

        // Depurar roles antiguos no permitidos
        var todosLosRoles = await roleManager.Roles.ToListAsync();
        foreach (var r in todosLosRoles)
        {
            if (!rolesPermitidos.Contains(r.Name ?? string.Empty))
            {
                // Eliminar asignaciones de privilegios asociadas
                var privsAsociados = await context.RolPrivilegios.Where(rp => rp.RoleId == r.Id).ToListAsync();
                if (privsAsociados.Any())
                {
                    context.RolPrivilegios.RemoveRange(privsAsociados);
                    await context.SaveChangesAsync();
                }
                await roleManager.DeleteAsync(r);
            }
        }

        if (!await roleManager.RoleExistsAsync(rolAdmin))
        {
            await roleManager.CreateAsync(new ApplicationRole(rolAdmin) { Descripcion = "Administrador completo del sistema", EsSistema = true, Activo = true });
        }

        // Roles adicionales del sistema
        var rolesAdicionales = new[] { "Docente", "Estudiante" };
        foreach (var rol in rolesAdicionales)
        {
            if (!await roleManager.RoleExistsAsync(rol))
            {
                await roleManager.CreateAsync(new ApplicationRole(rol) { EsSistema = true, Activo = true });
            }
        }

        // Usuario Administrador
        var user = await userManager.FindByEmailAsync("admin@sia.com");
        if (user == null)
        {
            user = new IdentityUser
            {
                UserName = "admin@sia.com",
                Email = "admin@sia.com",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, rolAdmin);
            }
        }
        else
        {
            if (!await userManager.IsInRoleAsync(user, rolAdmin))
            {
                await userManager.AddToRoleAsync(user, rolAdmin);
            }
        }

        // Estaciones iniciales
        if (!await context.Estaciones.IgnoreQueryFilters().AnyAsync(e => e.EmpresaId == empresa.Id))
        {
            var estaciones = new List<Estacion>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    Nombre = "Entrada Principal (Torniquete)",
                    Ubicacion = "Edificio Central - Acceso 1",
                    ClientId = "EST-ENTRADA-01",
                    ClientSecretHash = "hash_demo_secret",
                    DireccionIp = "192.168.1.50",
                    FirmwareVersion = "v1.2.0",
                    RequiereIdentificacion = true,
                    RequiereAprobacion = false,
                    Estado = true,
                    UltimaSincronizacion = DateTimeOffset.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    Nombre = "Laboratorio de Cómputo A",
                    Ubicacion = "Pabellón B - Sala 102",
                    ClientId = "EST-LAB-A",
                    ClientSecretHash = "hash_demo_secret",
                    DireccionIp = "192.168.1.51",
                    FirmwareVersion = "v1.2.0",
                    RequiereIdentificacion = true,
                    RequiereAprobacion = true,
                    Estado = true,
                    UltimaSincronizacion = DateTimeOffset.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    Nombre = "Biblioteca Central",
                    Ubicacion = "Edificio de Biblioteca",
                    ClientId = "EST-BIBLIO",
                    ClientSecretHash = "hash_demo_secret",
                    DireccionIp = "192.168.1.52",
                    FirmwareVersion = "v1.1.8",
                    RequiereIdentificacion = true,
                    RequiereAprobacion = false,
                    Estado = true,
                    UltimaSincronizacion = DateTimeOffset.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    Nombre = "Taller de Robótica",
                    Ubicacion = "Edificio de Ingeniería",
                    ClientId = "EST-TALLER",
                    ClientSecretHash = "hash_demo_secret",
                    DireccionIp = "192.168.1.53",
                    FirmwareVersion = "v1.2.0",
                    RequiereIdentificacion = true,
                    RequiereAprobacion = true,
                    Estado = true,
                    UltimaSincronizacion = DateTimeOffset.UtcNow
                }
            };
            context.Estaciones.AddRange(estaciones);
            await context.SaveChangesAsync();
        }

        // Tipos de Ítem iniciales
        if (!await context.TiposItem.IgnoreQueryFilters().AnyAsync(t => t.EmpresaId == empresa.Id))
        {
            var tipoLaptop = new TipoItem
            {
                Id = Guid.NewGuid(),
                EmpresaId = empresa.Id,
                Nombre = "Equipos Portátiles",
                Descripcion = "Laptops y ultrabooks para docencia y laboratorios",
                RequiereAprobacion = true,
                PermiteAgrupacion = false,
                Estado = true
            };

            var tipoInstrumento = new TipoItem
            {
                Id = Guid.NewGuid(),
                EmpresaId = empresa.Id,
                Nombre = "Instrumentos de Medición",
                Descripcion = "Osciloscopios, multímetros y fuentes de poder",
                RequiereAprobacion = true,
                PermiteAgrupacion = false,
                Estado = true
            };

            var tipoProyector = new TipoItem
            {
                Id = Guid.NewGuid(),
                EmpresaId = empresa.Id,
                Nombre = "Proyectores y Audio",
                Descripcion = "Equipos audiovisuales para salas y eventos",
                RequiereAprobacion = false,
                PermiteAgrupacion = false,
                Estado = true
            };

            var tipoKits = new TipoItem
            {
                Id = Guid.NewGuid(),
                EmpresaId = empresa.Id,
                Nombre = "Kits de Desarrollo",
                Descripcion = "Placas Arduino, Raspberry Pi y sensores",
                RequiereAprobacion = false,
                PermiteAgrupacion = true,
                Estado = true
            };

            context.TiposItem.AddRange(tipoLaptop, tipoInstrumento, tipoProyector, tipoKits);
            await context.SaveChangesAsync();

            // Estación para asociar ítems
            var estacionLab = await context.Estaciones.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.ClientId == "EST-LAB-A");

            // Ítems iniciales
            var items = new List<Item>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    TipoItemId = tipoLaptop.Id,
                    EstacionId = estacionLab?.Id,
                    CodigoQr = "ITM-001",
                    Nombre = "Laptop Dell XPS 15",
                    Observaciones = "Equipo para renderizado y desarrollo",
                    EstadoActual = EstadoItem.Disponible,
                    Estado = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    TipoItemId = tipoInstrumento.Id,
                    EstacionId = estacionLab?.Id,
                    CodigoQr = "ITM-002",
                    Nombre = "Osciloscopio Digital Tektronix",
                    Observaciones = "Canales 4, 100MHz",
                    EstadoActual = EstadoItem.Disponible,
                    Estado = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    TipoItemId = tipoProyector.Id,
                    EstacionId = estacionLab?.Id,
                    CodigoQr = "ITM-003",
                    Nombre = "Proyector Epson PowerLite HD",
                    Observaciones = "Resolución Full HD con HDMI",
                    EstadoActual = EstadoItem.Disponible,
                    Estado = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    TipoItemId = tipoKits.Id,
                    EstacionId = estacionLab?.Id,
                    CodigoQr = "ITM-004",
                    Nombre = "Kit Arduino IoT Avanzado",
                    Observaciones = "Incluye ESP32 y sensores IoT",
                    EstadoActual = EstadoItem.Disponible,
                    Estado = true
                }
            };
            context.Items.AddRange(items);
            await context.SaveChangesAsync();
        }

        // Sanitizar ítems eliminados que no hayan liberado el código QR único para evitar colisiones
        var itemsEliminados = await context.Items.IgnoreQueryFilters().Where(i => !i.Estado && !i.CodigoQr.Contains("_ELIMINADO_")).ToListAsync();
        if (itemsEliminados.Any())
        {
            foreach (var itemEliminado in itemsEliminados)
            {
                itemEliminado.CodigoQr = $"{itemEliminado.CodigoQr}_ELIMINADO_{Guid.NewGuid():N}";
            }
            await context.SaveChangesAsync();
        }

        // Personas iniciales adicionales
        if (!await context.Personas.IgnoreQueryFilters().AnyAsync(p => p.CodigoEstudiantil == "EST-2026-001"))
        {
            var estudiantesYDocentes = new List<Persona>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    CodigoEstudiantil = "EST-2026-001",
                    Nombres = "Carlos",
                    Apellidos = "Mendoza",
                    TipoPersona = TipoPersona.Estudiante,
                    Estado = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaId = empresa.Id,
                    CodigoEstudiantil = "DOC-2026-002",
                    Nombres = "Elena",
                    Apellidos = "Rosales",
                    TipoPersona = TipoPersona.Encargado,
                    Estado = true
                }
            };
            context.Personas.AddRange(estudiantesYDocentes);
            await context.SaveChangesAsync();
        }

        // Niveles de Permiso iniciales
        var niveles = new List<NivelPermiso>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111101"), Codigo = "C", Nombre = "Crear", Orden = 1, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111102"), Codigo = "L", Nombre = "Lectura", Orden = 2, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111103"), Codigo = "A", Nombre = "Actualizar", Orden = 3, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111104"), Codigo = "B", Nombre = "Borrar", Orden = 4, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111105"), Codigo = "E", Nombre = "Escritura", Orden = 5, Estado = true },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111106"), Codigo = "T", Nombre = "Total", Orden = 6, Estado = true },
        };

        foreach (var nivel in niveles)
        {
            var existente = await context.NivelesPermiso.FirstOrDefaultAsync(n => n.Codigo == nivel.Codigo);
            if (existente == null)
            {
                context.NivelesPermiso.Add(nivel);
            }
        }
        await context.SaveChangesAsync();

        // Privilegios del Sistema
        var privilegios = new List<Privilegio>
        {
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222201"), Codigo = "ACC", Nombre = "Control de Accesos", Modulo = "Accesos", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222202"), Codigo = "OPE", Nombre = "Operaciones y Préstamos", Modulo = "Operaciones", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222203"), Codigo = "PER", Nombre = "Gestión de Personas", Modulo = "Personas", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222204"), Codigo = "ITM", Nombre = "Gestión de Ítems e Inventario", Modulo = "Inventario", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222205"), Codigo = "TIP", Nombre = "Tipos de Ítems y Categorías", Modulo = "Catálogos", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222206"), Codigo = "EST", Nombre = "Configuración de Estaciones", Modulo = "Estaciones", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222207"), Codigo = "ROL", Nombre = "Gestión de Roles y Permisos", Modulo = "Seguridad", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222208"), Codigo = "USU", Nombre = "Gestión de Usuarios", Modulo = "Seguridad", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222209"), Codigo = "AUD", Nombre = "Auditoría y Bitácora", Modulo = "Auditoría", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222210"), Codigo = "REP", Nombre = "Reportes y Estadísticas", Modulo = "Reportes", Estado = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222211"), Codigo = "EMP", Nombre = "Configuración de Empresas", Modulo = "Configuración", Estado = true },
        };

        foreach (var priv in privilegios)
        {
            var existente = await context.Privilegios.FirstOrDefaultAsync(p => p.Codigo == priv.Codigo);
            if (existente == null)
            {
                context.Privilegios.Add(priv);
            }
        }
        await context.SaveChangesAsync();

        // Mapeo de Nivel y Privilegio en memoria
        var mapaNiveles = await context.NivelesPermiso.ToDictionaryAsync(n => n.Codigo, n => n.Id);
        var mapaPrivs = await context.Privilegios.ToDictionaryAsync(p => p.Codigo, p => p.Id);

        // Asignaciones de RolPrivilegio por defecto para roles del sistema
        async Task AsignarPrivilegiosRolAsync(string nombreRol, Dictionary<string, string> privNivelMap)
        {
            var rol = await roleManager.FindByNameAsync(nombreRol);
            if (rol == null) return;

            var asignados = await context.RolPrivilegios.Where(rp => rp.RoleId == rol.Id).ToListAsync();
            if (!asignados.Any())
            {
                var nuevos = new List<RolPrivilegio>();
                foreach (var kvp in privNivelMap)
                {
                    if (mapaPrivs.TryGetValue(kvp.Key, out var privId) && mapaNiveles.TryGetValue(kvp.Value, out var nivelId))
                    {
                        nuevos.Add(new RolPrivilegio
                        {
                            Id = Guid.NewGuid(),
                            RoleId = rol.Id,
                            PrivilegioId = privId,
                            NivelPermisoId = nivelId,
                            Estado = true,
                            FechaAsignacion = DateTimeOffset.UtcNow
                        });
                    }
                }
                context.RolPrivilegios.AddRange(nuevos);
                await context.SaveChangesAsync();
            }
        }

        // Docente: Operaciones Escritura, Accesos Lectura, Personas Lectura, Items Lectura, Tipos Lectura, Estaciones Lectura, Reportes Lectura
        await AsignarPrivilegiosRolAsync("Docente", new()
        {
            ["ACC"] = "L",
            ["OPE"] = "E",
            ["PER"] = "L",
            ["ITM"] = "L",
            ["TIP"] = "L",
            ["EST"] = "L",
            ["REP"] = "L"
        });

        // Estudiante: Accesos Lectura, Operaciones Lectura, Items Lectura
        await AsignarPrivilegiosRolAsync("Estudiante", new()
        {
            ["ACC"] = "L",
            ["OPE"] = "L",
            ["ITM"] = "L"
        });
    }
}
