using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class AtributoDefinicionConfiguracion : IEntityTypeConfiguration<AtributoDefinicion>
{
    public void Configure(EntityTypeBuilder<AtributoDefinicion> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Clave).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Etiqueta).HasMaxLength(200).IsRequired();
        builder.Property(e => e.TipoDato)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasIndex(e => new { e.EmpresaId, e.TipoItemId, e.Clave }).IsUnique();

        builder.HasOne(e => e.TipoItem)
            .WithMany(e => e.Atributos)
            .HasForeignKey(e => e.TipoItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
