using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sia.Domain.Entidades;

namespace Sia.Infrastructure.Persistencia.Configuraciones;

public class ItemAtributoValorConfiguracion : IEntityTypeConfiguration<ItemAtributoValor>
{
    public void Configure(EntityTypeBuilder<ItemAtributoValor> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.Valor).HasMaxLength(1000);

        builder.HasIndex(e => new { e.EmpresaId, e.ItemId, e.AtributoDefinicionId }).IsUnique();

        builder.HasOne(e => e.Item)
            .WithMany(e => e.AtributoValores)
            .HasForeignKey(e => e.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.AtributoDefinicion)
            .WithMany(e => e.Valores)
            .HasForeignKey(e => e.AtributoDefinicionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Empresa)
            .WithMany()
            .HasForeignKey(e => e.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
