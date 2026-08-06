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
    }
}
