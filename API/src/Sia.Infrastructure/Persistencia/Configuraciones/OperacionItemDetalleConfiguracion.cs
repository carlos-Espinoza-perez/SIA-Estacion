using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class OperacionItemDetalleConfiguracion : IEntityTypeConfiguration<OperacionItemDetalle>
{
    public void Configure(EntityTypeBuilder<OperacionItemDetalle> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.CondicionDevolucion)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.Observacion).HasMaxLength(1000);

        builder.HasIndex(e => new { e.EmpresaId, e.OperacionItemId, e.ItemId }).IsUnique();
        builder.HasIndex(e => new { e.EmpresaId, e.ItemId });

        builder.HasOne(e => e.OperacionItem)
            .WithMany(e => e.Detalles)
            .HasForeignKey(e => e.OperacionItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Item)
            .WithMany()
            .HasForeignKey(e => e.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
