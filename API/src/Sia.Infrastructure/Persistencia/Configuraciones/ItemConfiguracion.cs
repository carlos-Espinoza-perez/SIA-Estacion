using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class ItemConfiguracion : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.CodigoQr).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(e => e.EstadoActual)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.RowVersion)
            .IsRowVersion();

        builder.HasIndex(e => new { e.EmpresaId, e.CodigoQr }).IsUnique();
        builder.HasIndex(e => new { e.EmpresaId, e.TipoItemId, e.EstadoActual });

        builder.HasOne(e => e.TipoItem)
            .WithMany(e => e.Items)
            .HasForeignKey(e => e.TipoItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany(e => e.Items)
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
