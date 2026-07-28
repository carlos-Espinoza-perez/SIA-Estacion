using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Configuracion;
using Sia.Api.Middleware;
using Sia.Api.Hubs;
using Sia.Application.Abstracciones;
using Sia.Infrastructure.ServiciosAplicacion;
using Sia.Infrastructure.Persistencia;
using Sia.Infrastructure.Persistencia.Interceptores;
using Sia.Infrastructure.Seguridad;
using Sia.Infrastructure.Servicios;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddScoped<IContextoEmpresa, ContextoEmpresa>();
builder.Services.AddScoped<IContextoUsuario, ContextoUsuario>();
builder.Services.AddSingleton<IServicioHashSecreto, ServicioHashSecreto>();
builder.Services.AddSingleton<IServicioJwt, ServicioJwt>();
builder.Services.AddSingleton<IServicioAlmacenamiento, ServicioAlmacenamientoLocal>();
builder.Services.AddSingleton<IServicioReconocimientoFacial, ServicioReconocimientoFacial>();

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

var app = builder.Build();

app.UseMiddleware<ManejadorExcepcionesMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ContextoEmpresaMiddleware>();
app.MapControllers();
app.MapHub<MonitoreoHub>("/hubs/monitoreo");

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTimeOffset.UtcNow }));
app.MapGet("/api/health/ready", () => Results.Ok(new { status = "ready", timestamp = DateTimeOffset.UtcNow }));

app.Run();
