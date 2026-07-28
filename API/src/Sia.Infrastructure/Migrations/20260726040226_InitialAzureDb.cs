using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialAzureDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NivelesPermiso",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NivelesPermiso", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Privilegios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Modulo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Privilegios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditoriaCambios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Entidad = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Accion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ValoresAnteriores = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValoresNuevos = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    FechaHora = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriaCambios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditoriaCambios_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Estaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Ubicacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ClientId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ClientSecretHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RequiereIdentificacion = table.Column<bool>(type: "bit", nullable: false),
                    RequiereAprobacion = table.Column<bool>(type: "bit", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    UltimaSincronizacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Estaciones_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoEstudiantil = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombres = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Apellidos = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoPersona = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Personas_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TiposItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PermiteAgrupacion = table.Column<bool>(type: "bit", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TiposItem_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RolPrivilegios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    PrivilegioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NivelPermisoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    FechaAsignacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolPrivilegios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolPrivilegios_NivelesPermiso_NivelPermisoId",
                        column: x => x.NivelPermisoId,
                        principalTable: "NivelesPermiso",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RolPrivilegios_Privilegios_PrivilegioId",
                        column: x => x.PrivilegioId,
                        principalTable: "Privilegios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventosAcceso",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EstacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ModoValidacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Resultado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MotivoDenegacion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CodigoEscaneado = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FechaHoraLocal = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FechaSincronizacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventosAcceso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventosAcceso_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventosAcceso_Estaciones_EstacionId",
                        column: x => x.EstacionId,
                        principalTable: "Estaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventosAcceso_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FotosReferencia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    HashContenido = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    FechaCarga = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FechaEliminacion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FotosReferencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FotosReferencia_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FotosReferencia_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AtributosDefinicion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Clave = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Etiqueta = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoDato = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Requerido = table.Column<bool>(type: "bit", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AtributosDefinicion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AtributosDefinicion_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AtributosDefinicion_TiposItem_TipoItemId",
                        column: x => x.TipoItemId,
                        principalTable: "TiposItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EstacionTiposItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstacionTiposItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EstacionTiposItem_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EstacionTiposItem_Estaciones_EstacionId",
                        column: x => x.EstacionId,
                        principalTable: "Estaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EstacionTiposItem_TiposItem_TipoItemId",
                        column: x => x.TipoItemId,
                        principalTable: "TiposItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoQr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EsAgrupador = table.Column<bool>(type: "bit", nullable: false),
                    EstadoActual = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Items_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Items_TiposItem_TipoItemId",
                        column: x => x.TipoItemId,
                        principalTable: "TiposItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemAtributoValores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AtributoDefinicionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Valor = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemAtributoValores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemAtributoValores_AtributosDefinicion_AtributoDefinicionId",
                        column: x => x.AtributoDefinicionId,
                        principalTable: "AtributosDefinicion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemAtributoValores_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemAtributoValores_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemComposiciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemAgrupadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemComponenteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemComposiciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemComposiciones_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemComposiciones_Items_ItemAgrupadorId",
                        column: x => x.ItemAgrupadorId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemComposiciones_Items_ItemComponenteId",
                        column: x => x.ItemComponenteId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OperacionesItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemEscaneadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoOperacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EstadoActual = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    FechaSolicitud = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FechaCompromisoDevolucion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FechaDevolucion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AprobadoPorPersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperacionesItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperacionesItem_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionesItem_Estaciones_EstacionId",
                        column: x => x.EstacionId,
                        principalTable: "Estaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionesItem_Items_ItemEscaneadoId",
                        column: x => x.ItemEscaneadoId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionesItem_Personas_AprobadoPorPersonaId",
                        column: x => x.AprobadoPorPersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionesItem_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OperacionItemDetalles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OperacionItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CondicionDevolucion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FechaDevolucion = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Observacion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperacionItemDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperacionItemDetalles_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionItemDetalles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionItemDetalles_OperacionesItem_OperacionItemId",
                        column: x => x.OperacionItemId,
                        principalTable: "OperacionesItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OperacionMovimientos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    EmpresaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OperacionItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstadoAnterior = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EstadoNuevo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RegistradoPorPersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EstacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaHora = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperacionMovimientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperacionMovimientos_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionMovimientos_Estaciones_EstacionId",
                        column: x => x.EstacionId,
                        principalTable: "Estaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionMovimientos_OperacionesItem_OperacionItemId",
                        column: x => x.OperacionItemId,
                        principalTable: "OperacionesItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperacionMovimientos_Personas_RegistradoPorPersonaId",
                        column: x => x.RegistradoPorPersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AtributosDefinicion_EmpresaId_TipoItemId_Clave",
                table: "AtributosDefinicion",
                columns: new[] { "EmpresaId", "TipoItemId", "Clave" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AtributosDefinicion_TipoItemId",
                table: "AtributosDefinicion",
                column: "TipoItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaCambios_EmpresaId_Entidad_EntidadId",
                table: "AuditoriaCambios",
                columns: new[] { "EmpresaId", "Entidad", "EntidadId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaCambios_EmpresaId_FechaHora",
                table: "AuditoriaCambios",
                columns: new[] { "EmpresaId", "FechaHora" });

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Codigo",
                table: "Empresas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estaciones_EmpresaId_ClientId",
                table: "Estaciones",
                columns: new[] { "EmpresaId", "ClientId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EstacionTiposItem_EmpresaId_EstacionId_TipoItemId",
                table: "EstacionTiposItem",
                columns: new[] { "EmpresaId", "EstacionId", "TipoItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EstacionTiposItem_EstacionId",
                table: "EstacionTiposItem",
                column: "EstacionId");

            migrationBuilder.CreateIndex(
                name: "IX_EstacionTiposItem_TipoItemId",
                table: "EstacionTiposItem",
                column: "TipoItemId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosAcceso_EmpresaId_EstacionId_FechaHoraLocal",
                table: "EventosAcceso",
                columns: new[] { "EmpresaId", "EstacionId", "FechaHoraLocal" });

            migrationBuilder.CreateIndex(
                name: "IX_EventosAcceso_EmpresaId_PersonaId_FechaHoraLocal",
                table: "EventosAcceso",
                columns: new[] { "EmpresaId", "PersonaId", "FechaHoraLocal" });

            migrationBuilder.CreateIndex(
                name: "IX_EventosAcceso_EstacionId",
                table: "EventosAcceso",
                column: "EstacionId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosAcceso_PersonaId",
                table: "EventosAcceso",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_FotosReferencia_EmpresaId_PersonaId_Estado",
                table: "FotosReferencia",
                columns: new[] { "EmpresaId", "PersonaId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_FotosReferencia_PersonaId",
                table: "FotosReferencia",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemAtributoValores_AtributoDefinicionId",
                table: "ItemAtributoValores",
                column: "AtributoDefinicionId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemAtributoValores_EmpresaId_ItemId_AtributoDefinicionId",
                table: "ItemAtributoValores",
                columns: new[] { "EmpresaId", "ItemId", "AtributoDefinicionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemAtributoValores_ItemId",
                table: "ItemAtributoValores",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemComposiciones_EmpresaId_ItemAgrupadorId_ItemComponenteId",
                table: "ItemComposiciones",
                columns: new[] { "EmpresaId", "ItemAgrupadorId", "ItemComponenteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemComposiciones_ItemAgrupadorId",
                table: "ItemComposiciones",
                column: "ItemAgrupadorId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemComposiciones_ItemComponenteId",
                table: "ItemComposiciones",
                column: "ItemComponenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_EmpresaId_CodigoQr",
                table: "Items",
                columns: new[] { "EmpresaId", "CodigoQr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Items_EmpresaId_TipoItemId_EstadoActual",
                table: "Items",
                columns: new[] { "EmpresaId", "TipoItemId", "EstadoActual" });

            migrationBuilder.CreateIndex(
                name: "IX_Items_TipoItemId",
                table: "Items",
                column: "TipoItemId");

            migrationBuilder.CreateIndex(
                name: "IX_NivelesPermiso_Codigo",
                table: "NivelesPermiso",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_AprobadoPorPersonaId",
                table: "OperacionesItem",
                column: "AprobadoPorPersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_EmpresaId_ItemEscaneadoId_EstadoActual",
                table: "OperacionesItem",
                columns: new[] { "EmpresaId", "ItemEscaneadoId", "EstadoActual" });

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_EmpresaId_PersonaId_EstadoActual",
                table: "OperacionesItem",
                columns: new[] { "EmpresaId", "PersonaId", "EstadoActual" });

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_EstacionId",
                table: "OperacionesItem",
                column: "EstacionId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_ItemEscaneadoId",
                table: "OperacionesItem",
                column: "ItemEscaneadoId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionesItem_PersonaId",
                table: "OperacionesItem",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionItemDetalles_EmpresaId_ItemId",
                table: "OperacionItemDetalles",
                columns: new[] { "EmpresaId", "ItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_OperacionItemDetalles_EmpresaId_OperacionItemId_ItemId",
                table: "OperacionItemDetalles",
                columns: new[] { "EmpresaId", "OperacionItemId", "ItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OperacionItemDetalles_ItemId",
                table: "OperacionItemDetalles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionItemDetalles_OperacionItemId",
                table: "OperacionItemDetalles",
                column: "OperacionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionMovimientos_EmpresaId_OperacionItemId_FechaHora",
                table: "OperacionMovimientos",
                columns: new[] { "EmpresaId", "OperacionItemId", "FechaHora" });

            migrationBuilder.CreateIndex(
                name: "IX_OperacionMovimientos_EstacionId",
                table: "OperacionMovimientos",
                column: "EstacionId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionMovimientos_OperacionItemId",
                table: "OperacionMovimientos",
                column: "OperacionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OperacionMovimientos_RegistradoPorPersonaId",
                table: "OperacionMovimientos",
                column: "RegistradoPorPersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_EmpresaId_CodigoEstudiantil",
                table: "Personas",
                columns: new[] { "EmpresaId", "CodigoEstudiantil" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Privilegios_Codigo",
                table: "Privilegios",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolPrivilegios_NivelPermisoId",
                table: "RolPrivilegios",
                column: "NivelPermisoId");

            migrationBuilder.CreateIndex(
                name: "IX_RolPrivilegios_PrivilegioId",
                table: "RolPrivilegios",
                column: "PrivilegioId");

            migrationBuilder.CreateIndex(
                name: "IX_RolPrivilegios_RoleId_PrivilegioId_NivelPermisoId",
                table: "RolPrivilegios",
                columns: new[] { "RoleId", "PrivilegioId", "NivelPermisoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposItem_EmpresaId_Nombre",
                table: "TiposItem",
                columns: new[] { "EmpresaId", "Nombre" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AuditoriaCambios");

            migrationBuilder.DropTable(
                name: "EstacionTiposItem");

            migrationBuilder.DropTable(
                name: "EventosAcceso");

            migrationBuilder.DropTable(
                name: "FotosReferencia");

            migrationBuilder.DropTable(
                name: "ItemAtributoValores");

            migrationBuilder.DropTable(
                name: "ItemComposiciones");

            migrationBuilder.DropTable(
                name: "OperacionItemDetalles");

            migrationBuilder.DropTable(
                name: "OperacionMovimientos");

            migrationBuilder.DropTable(
                name: "RolPrivilegios");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "AtributosDefinicion");

            migrationBuilder.DropTable(
                name: "OperacionesItem");

            migrationBuilder.DropTable(
                name: "NivelesPermiso");

            migrationBuilder.DropTable(
                name: "Privilegios");

            migrationBuilder.DropTable(
                name: "Estaciones");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Personas");

            migrationBuilder.DropTable(
                name: "TiposItem");

            migrationBuilder.DropTable(
                name: "Empresas");
        }
    }
}
