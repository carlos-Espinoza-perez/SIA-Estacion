using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class EstacionTipoItemConfiguracion : IEntityTypeConfiguration<EstacionTipoItem>
{
    public void Configure(EntityTypeBuilder<EstacionTipoItem> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.HasIndex(e => new { e.EmpresaId, e.EstacionId, e.TipoItemId }).IsUnique();

        builder.HasOne(e => e.Estacion)
            .WithMany(e => e.TiposItemHabilitados)
            .HasForeignKey(e => e.EstacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.TipoItem)
            .WithMany(e => e.EstacionesTipoItem)
            .HasForeignKey(e => e.TipoItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
