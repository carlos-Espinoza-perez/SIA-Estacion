using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class OperacionMovimientoConfiguracion : IEntityTypeConfiguration<OperacionMovimiento>
{
    public void Configure(EntityTypeBuilder<OperacionMovimiento> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.EstadoAnterior)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.EstadoNuevo)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.Observacion).HasMaxLength(1000);

        builder.HasIndex(e => new { e.EmpresaId, e.OperacionItemId, e.FechaHora });

        builder.HasOne(e => e.OperacionItem)
            .WithMany(e => e.Movimientos)
            .HasForeignKey(e => e.OperacionItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.RegistradoPorPersona)
            .WithMany()
            .HasForeignKey(e => e.RegistradoPorPersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Estacion)
            .WithMany()
            .HasForeignKey(e => e.EstacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
