using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class PersonaConfiguracion : IEntityTypeConfiguration<Persona>
{
    public void Configure(EntityTypeBuilder<Persona> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.CodigoEstudiantil).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Nombres).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Apellidos).HasMaxLength(200).IsRequired();
        builder.Property(e => e.UserId).HasMaxLength(450);
        builder.Property(e => e.TipoPersona)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasIndex(e => new { e.EmpresaId, e.CodigoEstudiantil }).IsUnique();

        builder.HasOne(e => e.Empresa)
            .WithMany(e => e.Personas)
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
