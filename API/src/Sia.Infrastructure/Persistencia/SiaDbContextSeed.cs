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
        RoleManager<IdentityRole> roleManager)
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

        // Rol Administrador
        const string rolAdmin = "Administrador Global";
        if (!await roleManager.RoleExistsAsync(rolAdmin))
        {
            await roleManager.CreateAsync(new IdentityRole(rolAdmin));
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

        // Perfil de persona asociado al administrador
        var persona = await context.Personas.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.UserId == user.Id);
        if (persona == null)
        {
            persona = new Persona
            {
                Id = Guid.NewGuid(),
                EmpresaId = empresa.Id,
                CodigoEstudiantil = "ADMIN-QR",
                Nombres = "Administrador",
                Apellidos = "Global",
                TipoPersona = TipoPersona.Administrador,
                UserId = user.Id,
                Estado = true
            };
            context.Personas.Add(persona);
            await context.SaveChangesAsync();
        }

        // Roles adicionales del sistema
        var rolesAdicionales = new[] { "Guardia", "Operador", "Docente", "Estudiante" };
        foreach (var rol in rolesAdicionales)
        {
            if (!await roleManager.RoleExistsAsync(rol))
            {
                await roleManager.CreateAsync(new IdentityRole(rol));
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
    }
}
