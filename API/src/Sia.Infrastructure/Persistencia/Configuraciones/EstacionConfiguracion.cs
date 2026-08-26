using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class EstacionConfiguracion : IEntityTypeConfiguration<Estacion>
{
    public void Configure(EntityTypeBuilder<Estacion> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Ubicacion).HasMaxLength(500);
        builder.Property(e => e.FirmwareVersion).HasMaxLength(50);
        builder.Property(e => e.DireccionIp).HasMaxLength(50);
        builder.Property(e => e.ClientId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ClientSecretHash).HasMaxLength(500).IsRequired();
        builder.Property(e => e.MacAddress).HasMaxLength(50);
        builder.Property(e => e.CodigoVinculacion).HasMaxLength(50);

        builder.HasIndex(e => new { e.EmpresaId, e.ClientId }).IsUnique();

        builder.HasOne(e => e.Encargado)
            .WithMany()
            .HasForeignKey(e => e.EncargadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany(e => e.Estaciones)
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
