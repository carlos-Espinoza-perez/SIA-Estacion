using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class PrivilegioConfiguracion : IEntityTypeConfiguration<Privilegio>
{
    public void Configure(EntityTypeBuilder<Privilegio> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Codigo).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Modulo).HasMaxLength(100).IsRequired();

        builder.HasIndex(e => e.Codigo).IsUnique();
    }
}
