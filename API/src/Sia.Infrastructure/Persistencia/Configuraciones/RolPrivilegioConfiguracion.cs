using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class RolPrivilegioConfiguracion : IEntityTypeConfiguration<RolPrivilegio>
{
    public void Configure(EntityTypeBuilder<RolPrivilegio> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.RoleId).HasMaxLength(450).IsRequired();

        builder.HasIndex(e => new { e.RoleId, e.PrivilegioId, e.NivelPermisoId }).IsUnique();

        builder.HasOne(e => e.Privilegio)
            .WithMany(e => e.RolPrivilegios)
            .HasForeignKey(e => e.PrivilegioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.NivelPermiso)
            .WithMany(e => e.RolPrivilegios)
            .HasForeignKey(e => e.NivelPermisoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
