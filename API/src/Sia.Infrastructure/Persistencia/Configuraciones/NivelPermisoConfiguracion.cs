using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class NivelPermisoConfiguracion : IEntityTypeConfiguration<NivelPermiso>
{
    public void Configure(EntityTypeBuilder<NivelPermiso> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Codigo).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Nombre).HasMaxLength(100).IsRequired();

        builder.HasIndex(e => e.Codigo).IsUnique();
    }
}
