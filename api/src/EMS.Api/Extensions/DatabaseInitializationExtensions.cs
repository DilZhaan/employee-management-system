using EMS.Infrastructure.Persistence;
using EMS.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;

namespace EMS.Api.Extensions;

public static class DatabaseInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        var applyMigrations = app.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup");
        var seedData = app.Configuration.GetValue<bool>("Database:SeedOnStartup");

        if (!applyMigrations && !seedData)
        {
            return;
        }

        await using var scope = app.Services.CreateAsyncScope();

        if (applyMigrations)
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await dbContext.Database.MigrateAsync();
        }

        if (seedData)
        {
            var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
            await seeder.SeedAsync();
        }
    }
}
