using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Configuracion;
using Sia.Api.Middleware;
using Sia.Api.Hubs;
using Sia.Application.Abstracciones;
using Sia.Application.Servicios;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Infrastructure.Persistencia.Repositorios;
using Sia.Infrastructure.Persistencia;
using Sia.Infrastructure.Persistencia.Interceptores;
using Sia.Infrastructure.Seguridad;
using Sia.Infrastructure.Servicios;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddAutoMapper(config => 
{
    config.AddMaps(AppDomain.CurrentDomain.GetAssemblies());
});

builder.Services.AddOptions<JwtOpciones>().BindConfiguration(JwtOpciones.Seccion).ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<AlmacenamientoOpciones>().BindConfiguration(AlmacenamientoOpciones.Seccion).ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<ReconocimientoOpciones>().BindConfiguration(ReconocimientoOpciones.Seccion).ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<QrOpciones>().BindConfiguration(QrOpciones.Seccion).ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<SincronizacionOpciones>().BindConfiguration(SincronizacionOpciones.Seccion).ValidateDataAnnotations().ValidateOnStart();

builder.Services.AddScoped<AuditoriaInterceptor>();

string connectionString = builder.Configuration.GetConnectionString("SqlServer") ?? string.Empty;
builder.Services.AddDbContext<SiaDbContext>((sp, options) =>
{
    if (!string.IsNullOrEmpty(connectionString))
        options.UseSqlServer(connectionString);
    else
        options.UseSqlServer();

    options.AddInterceptors(sp.GetRequiredService<AuditoriaInterceptor>());
});

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<SiaDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtOpciones = builder.Configuration.GetSection(JwtOpciones.Seccion).Get<JwtOpciones>()!;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtOpciones.Issuer,
        ValidAudience = jwtOpciones.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOpciones.SigningKey))
    };
});

builder.Services.AddAuthorization(options =>
{
    var defaultPolicy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .Build();
    options.DefaultPolicy = defaultPolicy;
});

builder.Services.AddSingleton<IAuthorizationPolicyProvider, PrivilegioPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, ManejadorPrivilegio>();

builder.Services.AddScoped<IContextoEmpresa, ContextoEmpresa>();
builder.Services.AddScoped<IContextoUsuario, ContextoUsuario>();
builder.Services.AddSingleton<IServicioHashSecreto, ServicioHashSecreto>();
builder.Services.AddSingleton<IServicioJwt, ServicioJwt>();
builder.Services.AddSingleton<IServicioAlmacenamiento, ServicioAlmacenamientoBlob>();
builder.Services.AddSingleton<IServicioReconocimientoFacial, ServicioReconocimientoFacial>();

builder.Services.AddScoped<IItemsRepository, ItemsRepository>();
builder.Services.AddScoped<IPersonasRepository, PersonasRepository>();
builder.Services.AddScoped<IEstacionesRepository, EstacionesRepository>();
builder.Services.AddScoped<IOperacionesRepository, OperacionesRepository>();
builder.Services.AddScoped<ISeguridadRepository, SeguridadRepository>();
builder.Services.AddScoped<IEmpresasRepository, EmpresasRepository>();
builder.Services.AddScoped<IEventosRepository, EventosRepository>();

builder.Services.AddScoped<ServicioAuth>();
builder.Services.AddScoped<ServicioPrivilegios>();
builder.Services.AddScoped<ServicioNivelesPermiso>();
builder.Services.AddScoped<ServicioRoles>();
builder.Services.AddScoped<ServicioUsuarios>();
builder.Services.AddScoped<ServicioEmpresas>();
builder.Services.AddScoped<ServicioPersonas>();
builder.Services.AddScoped<ServicioItems>();
builder.Services.AddScoped<ServicioEstaciones>();
builder.Services.AddScoped<ServicioAcceso>();
builder.Services.AddScoped<ServicioOperaciones>();
builder.Services.AddScoped<ServicioReportes>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sia API", Version = "v1" });
    
    // Configurar JWT para Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese 'Bearer' [espacio] y luego su token válido.\n\nEjemplo: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<ManejadorExcepcionesMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sia API v1"));
}

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ContextoEmpresaMiddleware>();

_ = Task.Run(async () =>
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<SiaDbContext>();
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        
        await context.Database.MigrateAsync();
        await SiaDbContextSeed.SeedAsync(context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning("Aviso al verificar la base de datos: {Message}", ex.Message);
    }
});

app.MapControllers();
app.MapHub<MonitoreoHub>("/hubs/monitoreo");

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTimeOffset.UtcNow }));
app.MapGet("/api/health/ready", () => Results.Ok(new { status = "ready", timestamp = DateTimeOffset.UtcNow }));

app.Run();
