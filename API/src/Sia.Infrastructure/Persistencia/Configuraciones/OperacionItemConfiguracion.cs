using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class OperacionItemConfiguracion : IEntityTypeConfiguration<OperacionItem>
{
    public void Configure(EntityTypeBuilder<OperacionItem> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Folio).HasMaxLength(30).IsRequired();
        builder.Property(e => e.Observaciones).HasMaxLength(1000);
        builder.Property(e => e.TipoOperacion)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.EstadoActual)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.RowVersion)
            .IsRowVersion();

        builder.HasIndex(e => new { e.EmpresaId, e.Folio }).IsUnique();
        builder.HasIndex(e => new { e.EmpresaId, e.PersonaId, e.EstadoActual });
        builder.HasIndex(e => new { e.EmpresaId, e.ItemEscaneadoId, e.EstadoActual });

        builder.HasOne(e => e.ItemEscaneado)
            .WithMany()
            .HasForeignKey(e => e.ItemEscaneadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Persona)
            .WithMany(e => e.Operaciones)
            .HasForeignKey(e => e.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Estacion)
            .WithMany()
            .HasForeignKey(e => e.EstacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.AprobadoPorPersona)
            .WithMany()
            .HasForeignKey(e => e.AprobadoPorPersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
