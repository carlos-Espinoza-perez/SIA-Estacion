using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia;

public class SiaDbContext : IdentityDbContext<IdentityUser, ApplicationRole, string>
{
    private readonly IContextoEmpresa _contextoEmpresa;

    public SiaDbContext(DbContextOptions<SiaDbContext> options, IContextoEmpresa contextoEmpresa)
        : base(options)
    {
        _contextoEmpresa = contextoEmpresa;
    }

    public DbSet<Empresa> Empresas => Set<Empresa>();
    public DbSet<Persona> Personas => Set<Persona>();
    public DbSet<FotoReferencia> FotosReferencia => Set<FotoReferencia>();
    public DbSet<TipoItem> TiposItem => Set<TipoItem>();
    public DbSet<AtributoDefinicion> AtributosDefinicion => Set<AtributoDefinicion>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<ItemAtributoValor> ItemAtributoValores => Set<ItemAtributoValor>();
    public DbSet<ItemComposicion> ItemComposiciones => Set<ItemComposicion>();
    public DbSet<Estacion> Estaciones => Set<Estacion>();
    public DbSet<EstacionTipoItem> EstacionTiposItem => Set<EstacionTipoItem>();
    public DbSet<EventoAcceso> EventosAcceso => Set<EventoAcceso>();
    public DbSet<OperacionItem> OperacionesItem => Set<OperacionItem>();
    public DbSet<OperacionItemDetalle> OperacionItemDetalles => Set<OperacionItemDetalle>();
    public DbSet<OperacionMovimiento> OperacionMovimientos => Set<OperacionMovimiento>();
    public DbSet<AuditoriaCambio> AuditoriaCambios => Set<AuditoriaCambio>();
    public DbSet<Privilegio> Privilegios => Set<Privilegio>();
    public DbSet<NivelPermiso> NivelesPermiso => Set<NivelPermiso>();
    public DbSet<RolPrivilegio> RolPrivilegios => Set<RolPrivilegio>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(SiaDbContext).Assembly);

        ConfigurarFiltrosGlobales(builder);
    }

    private void ConfigurarFiltrosGlobales(ModelBuilder builder)
    {
        builder.Entity<Persona>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<FotoReferencia>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<TipoItem>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<AtributoDefinicion>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<Item>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<ItemAtributoValor>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<ItemComposicion>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<Estacion>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<EstacionTipoItem>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<EventoAcceso>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<OperacionItem>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<OperacionItemDetalle>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<OperacionMovimiento>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<AuditoriaCambio>().HasQueryFilter(e => e.EmpresaId == _contextoEmpresa.EmpresaId);
        builder.Entity<RolPrivilegio>().HasQueryFilter(e => true);
    }
}
