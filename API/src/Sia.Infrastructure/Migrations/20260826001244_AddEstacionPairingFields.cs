using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEstacionPairingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodigoVinculacion",
                table: "Estaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EstaVinculada",
                table: "Estaciones",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "FechaVinculacion",
                table: "Estaciones",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MacAddress",
                table: "Estaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodigoVinculacion",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "EstaVinculada",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "FechaVinculacion",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "MacAddress",
                table: "Estaciones");
        }
    }
}
