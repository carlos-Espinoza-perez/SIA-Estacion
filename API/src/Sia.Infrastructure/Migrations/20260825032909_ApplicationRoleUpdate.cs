using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ApplicationRoleUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "AspNetRoles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "AspNetRoles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EsSistema",
                table: "AspNetRoles",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "EsSistema",
                table: "AspNetRoles");
        }
    }
}
