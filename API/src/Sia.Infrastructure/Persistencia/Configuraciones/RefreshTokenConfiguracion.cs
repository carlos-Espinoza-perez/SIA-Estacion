using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class RefreshTokenConfiguracion : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.UserId).HasMaxLength(450).IsRequired();
        builder.Property(e => e.TokenHash).HasMaxLength(88).IsRequired();

        builder.HasIndex(e => e.TokenHash).IsUnique();
        builder.HasIndex(e => e.UserId);
    }
}
