using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class AuditoriaCambioConfiguracion : IEntityTypeConfiguration<AuditoriaCambio>
{
    public void Configure(EntityTypeBuilder<AuditoriaCambio> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Entidad).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Accion).HasMaxLength(50).IsRequired();
        builder.Property(e => e.UserId).HasMaxLength(450);

        builder.HasIndex(e => new { e.EmpresaId, e.Entidad, e.EntidadId });
        builder.HasIndex(e => new { e.EmpresaId, e.FechaHora });

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
