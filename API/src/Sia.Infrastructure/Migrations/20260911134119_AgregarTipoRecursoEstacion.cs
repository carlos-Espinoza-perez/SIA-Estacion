using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTipoRecursoEstacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TipoRecurso",
                table: "Estaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "ControlAcceso");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TipoRecurso",
                table: "Estaciones");
        }
    }
}
