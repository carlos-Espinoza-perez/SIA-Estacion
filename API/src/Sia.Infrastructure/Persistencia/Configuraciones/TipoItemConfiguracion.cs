using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class TipoItemConfiguracion : IEntityTypeConfiguration<TipoItem>
{
    public void Configure(EntityTypeBuilder<TipoItem> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Descripcion).HasMaxLength(500);

        builder.HasIndex(e => new { e.EmpresaId, e.Nombre }).IsUnique();

        builder.HasOne(e => e.Empresa)
            .WithMany(e => e.TiposItem)
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
