using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class ItemComposicionConfiguracion : IEntityTypeConfiguration<ItemComposicion>
{
    public void Configure(EntityTypeBuilder<ItemComposicion> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.HasIndex(e => new { e.EmpresaId, e.ItemAgrupadorId, e.ItemComponenteId }).IsUnique();

        builder.HasOne(e => e.ItemAgrupador)
            .WithMany(e => e.ComponentesDe)
            .HasForeignKey(e => e.ItemAgrupadorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ItemComponente)
            .WithMany(e => e.AgrupadorDe)
            .HasForeignKey(e => e.ItemComponenteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
