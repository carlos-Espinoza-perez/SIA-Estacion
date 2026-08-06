using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class EventoAccesoConfiguracion : IEntityTypeConfiguration<EventoAcceso>
{
    public void Configure(EntityTypeBuilder<EventoAcceso> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.CodigoEscaneado).HasMaxLength(500).IsRequired();
        builder.Property(e => e.MotivoDenegacion).HasMaxLength(200);
        builder.Property(e => e.FotoEvidenciaUrl).HasMaxLength(500);
        builder.Property(e => e.Direccion)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.ModoValidacion)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.Resultado)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasIndex(e => new { e.EmpresaId, e.PersonaId, e.FechaHoraLocal });
        builder.HasIndex(e => new { e.EmpresaId, e.EstacionId, e.FechaHoraLocal });

        builder.HasOne(e => e.Persona)
            .WithMany(e => e.EventosAcceso)
            .HasForeignKey(e => e.PersonaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Estacion)
            .WithMany(e => e.EventosAcceso)
            .HasForeignKey(e => e.EstacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
