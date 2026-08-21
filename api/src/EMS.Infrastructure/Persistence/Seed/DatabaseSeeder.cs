using EMS.Application.Abstractions.Authentication;
using EMS.Domain.Entities;
using EMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EMS.Infrastructure.Persistence.Seed;

public sealed class DatabaseSeeder
{
    private const string SeedPasswordEnvironmentVariable = "EMS_SEED_PASSWORD";

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public DatabaseSeeder(
        AppDbContext dbContext,
        IPasswordHasher passwordHasher,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _dbContext.Departments.AnyAsync(cancellationToken))
        {
            return;
        }

        var engineering = new Department("Engineering", "ENG");
        var humanResources = new Department("Human Resources", "HR");
        var finance = new Department("Finance", "FIN");

        await _dbContext.Departments.AddRangeAsync(
            [engineering, humanResources, finance],
            cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var seedPassword = _configuration["SeedData:Password"]
            ?? Environment.GetEnvironmentVariable(SeedPasswordEnvironmentVariable);
        if (string.IsNullOrWhiteSpace(seedPassword))
        {
            throw new InvalidOperationException($"{SeedPasswordEnvironmentVariable} is required to seed development users.");
        }

        var admin = new Employee(
            "ADM-001",
            "Amina",
            "Perera",
            "admin@ems.local",
            _passwordHasher.Hash(seedPassword),
            "+94110000001",
            humanResources.Id,
            EmployeeRole.Admin);
        var manager = new Employee(
            "MGR-001",
            "Nuwan",
            "Silva",
            "manager@ems.local",
            _passwordHasher.Hash(seedPassword),
            "+94110000002",
            engineering.Id,
            EmployeeRole.Manager,
            admin.Id);
        var employee = new Employee(
            "EMP-001",
            "Kavindi",
            "Fernando",
            "employee@ems.local",
            _passwordHasher.Hash(seedPassword),
            "+94110000003",
            engineering.Id,
            EmployeeRole.Employee,
            manager.Id);

        await _dbContext.Employees.AddRangeAsync([admin, manager, employee], cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var yesterday = DateTime.UtcNow.Date.AddDays(-1).AddHours(3);
        var completedAttendance = new AttendanceLog(employee.Id, yesterday, AttendanceStatus.Present, DeviceType.Web);
        completedAttendance.CheckOut(yesterday.AddHours(8));
        var lateAttendance = new AttendanceLog(
            manager.Id,
            DateTime.UtcNow.Date.AddDays(-2).AddHours(5),
            AttendanceStatus.Late,
            DeviceType.Mobile);
        lateAttendance.CheckOut(lateAttendance.CheckInTime.AddHours(8));

        await _dbContext.AttendanceLogs.AddRangeAsync([completedAttendance, lateAttendance], cancellationToken);

        var pendingLeave = new LeaveRequest(
            employee.Id,
            LeaveType.Annual,
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(10)),
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(12)),
            "Family event");
        var approvedLeave = new LeaveRequest(
            employee.Id,
            LeaveType.Sick,
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-20)),
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-19)),
            "Medical recovery");
        approvedLeave.Approve(manager.Id);
        var rejectedLeave = new LeaveRequest(
            manager.Id,
            LeaveType.Unpaid,
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(20)),
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(21)),
            "Personal travel");
        rejectedLeave.Reject(admin.Id);

        await _dbContext.LeaveRequests.AddRangeAsync(
            [pendingLeave, approvedLeave, rejectedLeave],
            cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
