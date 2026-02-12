using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using FieldConnect.Api.Repositories;
using FieldConnect.Api.Validators;
using FieldConnect.Api.Middleware;
using FluentValidation;
using FieldConnect.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using FieldConnect.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(worker =>
    {
        worker.UseMiddleware<GlobalExceptionHandlerMiddleware>();
        worker.UseMiddleware<JwtMiddleware>();
        worker.UseMiddleware<SecurityHeadersMiddleware>();
    })
    .ConfigureServices((context, services) =>
    {
        var databasePath = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING") 
                            ?? Environment.GetEnvironmentVariable("DATABASE_PATH") 
                            ?? "fieldconnect.db";
        
        Console.WriteLine($"[INFO] Usando Base de Datos en: {Path.GetFullPath(databasePath)}");

        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "fallback-secret-for-dev-only";
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "FieldConnect";

        // Initialize Database if not exists
        try {
            InitializeDatabase(databasePath);
            Console.WriteLine("[INFO] Base de Datos Inicializada.");
        } catch (Exception ex) {
            Console.WriteLine($"[ERROR] Error inicializando DB: {ex.Message}");
        }

        services.AddScoped<IAuthService>(sp => new AuthService(jwtSecret, jwtIssuer));
        services.AddScoped<FieldConnect.Api.Services.IValidationService, FieldConnect.Api.Services.ValidationService>();
        services.AddScoped<IAppointmentRepository>(sp => new AppointmentRepository(databasePath));
        services.AddScoped<IValidator<AppointmentDTO>, AppointmentValidator>();
    })
    .Build();

host.Run();

void InitializeDatabase(string dbPath)
{
    if (!File.Exists(dbPath))
    {
        using var connection = new SqliteConnection($"Data Source={dbPath}");
        connection.Open();
        var script = File.ReadAllText("init.sql");
        var command = connection.CreateCommand();
        command.CommandText = script;
        command.ExecuteNonQuery();
    }
}
