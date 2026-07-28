using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class FotoReferenciaConfiguracion : IEntityTypeConfiguration<FotoReferencia>
{
    public void Configure(EntityTypeBuilder<FotoReferencia> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Url).HasMaxLength(500).IsRequired();
        builder.Property(e => e.HashContenido).HasMaxLength(128).IsRequired();

        builder.HasIndex(e => new { e.EmpresaId, e.PersonaId, e.Estado });

        builder.HasOne(e => e.Persona)
            .WithMany(e => e.FotosReferencia)
            .HasForeignKey(e => e.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
