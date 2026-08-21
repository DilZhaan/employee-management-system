using EMS.Application.Exceptions;
using EMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace EMS.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<Department> Departments => Set<Department>();

    public DbSet<AttendanceLog> AttendanceLogs => Set<AttendanceLog>();

    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (IsUniqueConstraintViolation(exception))
        {
            throw new ConflictException("A record with the same unique value already exists.");
        }
    }

    private static bool IsUniqueConstraintViolation(Exception exception)
    {
        return exception is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation }
            || exception.InnerException is not null && IsUniqueConstraintViolation(exception.InnerException);
    }
}
