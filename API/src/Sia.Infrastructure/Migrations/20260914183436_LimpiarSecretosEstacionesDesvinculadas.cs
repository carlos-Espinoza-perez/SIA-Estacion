using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LimpiarSecretosEstacionesDesvinculadas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migracion de datos (no de esquema): antes de este fix, Desvincular no
            // invalidaba el ClientSecretHash, asi que estaciones ya desvinculadas
            // antes del fix quedaron con un secreto viejo todavia valido. Se limpia
            // aqui para las que ya estan desvinculadas; las que se desvinculen de
            // ahora en adelante ya lo hacen via ServicioEstaciones.DesvincularAsync.
            migrationBuilder.Sql(
                "UPDATE Estaciones SET ClientSecretHash = '' WHERE EstaVinculada = 0 AND ClientSecretHash <> '';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No reversible: el secreto original ya no se puede recuperar.
        }
    }
}
