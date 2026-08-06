using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposCorrelacionFrontend : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "TiposItem",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiereAprobacion",
                table: "TiposItem",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CarreraOArea",
                table: "Personas",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Correo",
                table: "Personas",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Telefono",
                table: "Personas",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Folio",
                table: "OperacionesItem",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Observaciones",
                table: "OperacionesItem",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EstacionId",
                table: "Items",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observaciones",
                table: "Items",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FotoEvidenciaUrl",
                table: "EventosAcceso",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DireccionIp",
                table: "Estaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EncargadoId",
                table: "Estaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirmwareVersion",
                table: "Estaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "AuditoriaCambios",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EstacionId",
                table: "AuditoriaCambios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Origen",
                table: "AuditoriaCambios",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_EmpresaId_Folio",
                table: "OperacionesItem",
                columns: new[] { "EmpresaId", "Folio" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Items_EmpresaId_EstacionId",
                table: "Items",
                columns: new[] { "EmpresaId", "EstacionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Items_EstacionId",
                table: "Items",
                column: "EstacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Estaciones_EncargadoId",
                table: "Estaciones",
                column: "EncargadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Estaciones_Personas_EncargadoId",
                table: "Estaciones",
                column: "EncargadoId",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Items_Estaciones_EstacionId",
                table: "Items",
                column: "EstacionId",
                principalTable: "Estaciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estaciones_Personas_EncargadoId",
                table: "Estaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Items_Estaciones_EstacionId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_OperacionesItem_EmpresaId_Folio",
                table: "OperacionesItem");

            migrationBuilder.DropIndex(
                name: "IX_Items_EmpresaId_EstacionId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Items_EstacionId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Estaciones_EncargadoId",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "TiposItem");

            migrationBuilder.DropColumn(
                name: "RequiereAprobacion",
                table: "TiposItem");

            migrationBuilder.DropColumn(
                name: "CarreraOArea",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "Correo",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "Telefono",
                table: "Personas");

            migrationBuilder.DropColumn(
                name: "Folio",
                table: "OperacionesItem");

            migrationBuilder.DropColumn(
                name: "Observaciones",
                table: "OperacionesItem");

            migrationBuilder.DropColumn(
                name: "EstacionId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Observaciones",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "FotoEvidenciaUrl",
                table: "EventosAcceso");

            migrationBuilder.DropColumn(
                name: "DireccionIp",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "EncargadoId",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "FirmwareVersion",
                table: "Estaciones");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "AuditoriaCambios");

            migrationBuilder.DropColumn(
                name: "EstacionId",
                table: "AuditoriaCambios");

            migrationBuilder.DropColumn(
                name: "Origen",
                table: "AuditoriaCambios");
        }
    }
}
