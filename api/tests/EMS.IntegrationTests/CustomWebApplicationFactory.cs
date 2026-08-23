using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Auth;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Application.DTOs.Employees;
using EMS.Application.DTOs.Leave;
using EMS.Application.Exceptions;
using EMS.Application.Services;
using EMS.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;

namespace EMS.IntegrationTests;

public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string JwtSecret = "integration-test-secret-value-32-bytes-minimum";
    public const string JwtIssuer = "EMS.IntegrationTests";
    public const string JwtAudience = "EMS.TestClients";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(configuration =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Port=5432;Database=ems_tests;Username=ems;Password=test-password",
                ["Jwt:Secret"] = JwtSecret,
                ["Jwt:Issuer"] = JwtIssuer,
                ["Jwt:Audience"] = JwtAudience,
                ["Jwt:ExpirationMinutes"] = "60",
                ["Database:ApplyMigrationsOnStartup"] = "false",
                ["Database:SeedOnStartup"] = "false",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IAuthService>();
            services.RemoveAll<IDepartmentService>();
            services.RemoveAll<IEmployeeService>();
            services.RemoveAll<IAttendanceService>();
            services.RemoveAll<ILeaveService>();

            services.AddSingleton<FakeApplicationState>();
            services.AddScoped<IAuthService, FakeAuthService>();
            services.AddScoped<IDepartmentService, FakeDepartmentService>();
            services.AddScoped<IEmployeeService, FakeEmployeeService>();
            services.AddScoped<IAttendanceService, FakeAttendanceService>();
            services.AddScoped<ILeaveService, FakeLeaveService>();

            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = JwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = JwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1),
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret)),
                    RoleClaimType = ClaimTypes.Role,
                    NameClaimType = "employee_id"
                };
            });
        });
    }

    public static string CreateToken(Guid employeeId, EmployeeRole role, string email, DateTime? expires = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, employeeId.ToString()),
            new Claim("employee_id", employeeId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role.ToString())
        };
        var token = new JwtSecurityToken(
            issuer: JwtIssuer,
            audience: JwtAudience,
            claims: claims,
            expires: expires ?? DateTime.UtcNow.AddMinutes(30),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static HttpClient CreateClientWithRole(
        WebApplicationFactory<Program> factory,
        EmployeeRole role,
        Guid? employeeId = null)
    {
        var client = factory.CreateClient();
        var id = employeeId ?? role switch
        {
            EmployeeRole.Admin => FakeApplicationState.AdminId,
            EmployeeRole.Manager => FakeApplicationState.ManagerId,
            _ => FakeApplicationState.EmployeeId
        };
        var token = CreateToken(id, role, $"{role.ToString().ToLowerInvariant()}@ems.local");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}

public sealed class FakeApplicationState
{
    public static readonly Guid AdminId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid ManagerId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid EmployeeId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    public static readonly Guid OtherEmployeeId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

    public Guid DepartmentId { get; } = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public bool AttendanceActive { get; set; }

    public bool LeaveApproved { get; set; }
}

internal sealed class FakeAuthService : IAuthService
{
    public Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Email == "bad@example.com")
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        var employee = new EmployeeResponse(
            FakeApplicationState.AdminId,
            "ADM-001",
            "Amina",
            "Perera",
            "admin@ems.local",
            null,
            Guid.NewGuid(),
            EmployeeRole.Admin,
            null,
            true,
            DateTime.UtcNow);
        var token = CustomWebApplicationFactory.CreateToken(employee.Id, employee.Role, employee.Email);

        return Task.FromResult(new LoginResponse(token, employee));
    }
}

internal sealed class FakeDepartmentService : IDepartmentService
{
    private readonly FakeApplicationState _state;

    public FakeDepartmentService(FakeApplicationState state)
    {
        _state = state;
    }

    public Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToResponse(_state.DepartmentId));
    }

    public Task DeactivateDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task ActivateDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task<DepartmentResponse> GetDepartmentByIdAsync(Guid departmentId, CancellationToken cancellationToken = default)
    {
        if (departmentId == Guid.Empty)
        {
            throw new NotFoundException("Department was not found.");
        }

        return Task.FromResult(ToResponse(departmentId));
    }

    public Task<PagedResult<DepartmentResponse>> GetDepartmentsAsync(DepartmentQuery query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new PagedResult<DepartmentResponse>(
            [ToResponse(_state.DepartmentId)],
            query.Page,
            query.PageSize,
            1));
    }

    public Task<DepartmentResponse> UpdateDepartmentAsync(Guid departmentId, UpdateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToResponse(departmentId));
    }

    private static DepartmentResponse ToResponse(Guid id)
    {
        return new DepartmentResponse(id, "Engineering", "ENG", true, DateTime.UtcNow);
    }
}

internal sealed class FakeEmployeeService : IEmployeeService
{
    private readonly FakeApplicationState _state;
    private bool _createdEmail;

    public FakeEmployeeService(FakeApplicationState state)
    {
        _state = state;
    }

    public Task<EmployeeResponse> CreateEmployeeAsync(CreateEmployeeRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@', StringComparison.Ordinal))
        {
            throw new FluentValidation.ValidationException(
                [new FluentValidation.Results.ValidationFailure(nameof(request.Email), "Email is invalid.")]);
        }

        if (_createdEmail || request.Email == "duplicate@example.com")
        {
            throw new ConflictException("Employee email already exists.");
        }

        _createdEmail = true;
        return Task.FromResult(ToResponse(Guid.NewGuid(), request.Email, request.Role));
    }

    public Task DeactivateEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task ActivateEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task<EmployeeResponse> GetEmployeeByIdAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        if (employeeId == Guid.Empty)
        {
            throw new NotFoundException("Employee was not found.");
        }

        return Task.FromResult(ToResponse(employeeId, "employee@ems.local", EmployeeRole.Employee));
    }

    public Task<PagedResult<EmployeeResponse>> GetEmployeesAsync(EmployeeQuery query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new PagedResult<EmployeeResponse>(
            [ToResponse(FakeApplicationState.EmployeeId, "employee@ems.local", EmployeeRole.Employee)],
            query.Page,
            query.PageSize,
            1));
    }

    public Task<EmployeeResponse> UpdateEmployeeAsync(Guid employeeId, UpdateEmployeeRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToResponse(employeeId, request.Email, request.Role));
    }

    private EmployeeResponse ToResponse(Guid id, string email, EmployeeRole role)
    {
        return new EmployeeResponse(
            id,
            "EMP-001",
            "Ada",
            "Lovelace",
            email,
            null,
            _state.DepartmentId,
            role,
            role == EmployeeRole.Employee ? FakeApplicationState.ManagerId : null,
            true,
            DateTime.UtcNow);
    }
}

internal sealed class FakeAttendanceService : IAttendanceService
{
    private readonly FakeApplicationState _state;

    public FakeAttendanceService(FakeApplicationState state)
    {
        _state = state;
    }

    public Task<AttendanceResponse> CheckInAsync(CheckInRequest request, CancellationToken cancellationToken = default)
    {
        if (_state.AttendanceActive)
        {
            throw new ConflictException("Employee already has an active attendance record.");
        }

        _state.AttendanceActive = true;
        return Task.FromResult(ToResponse(FakeApplicationState.EmployeeId, null));
    }

    public Task<AttendanceResponse> CheckOutAsync(CancellationToken cancellationToken = default)
    {
        if (!_state.AttendanceActive)
        {
            throw new ConflictException("Employee does not have an active attendance record.");
        }

        _state.AttendanceActive = false;
        return Task.FromResult(ToResponse(FakeApplicationState.EmployeeId, DateTime.UtcNow));
    }

    public Task<PagedResult<AttendanceResponse>> GetAttendanceAsync(AttendanceQuery query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToPagedResult(query, query.EmployeeId ?? FakeApplicationState.EmployeeId));
    }

    public Task<PagedResult<AttendanceResponse>> GetMyAttendanceAsync(AttendanceQuery query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToPagedResult(query, FakeApplicationState.EmployeeId));
    }

    private static PagedResult<AttendanceResponse> ToPagedResult(AttendanceQuery query, Guid employeeId)
    {
        return new PagedResult<AttendanceResponse>(
            [ToResponse(employeeId, DateTime.UtcNow)],
            query.Page,
            query.PageSize,
            1);
    }

    private static AttendanceResponse ToResponse(Guid employeeId, DateTime? checkOutTime)
    {
        return new AttendanceResponse(
            Guid.NewGuid(),
            employeeId,
            "EMP-001",
            "Demo Employee",
            DateTime.UtcNow.AddHours(-1),
            checkOutTime,
            DateOnly.FromDateTime(DateTime.UtcNow),
            AttendanceStatus.Present,
            DeviceType.Web);
    }
}

internal sealed class FakeLeaveService : ILeaveService
{
    private readonly FakeApplicationState _state;

    public FakeLeaveService(FakeApplicationState state)
    {
        _state = state;
    }

    public Task<LeaveRequestResponse> ApproveLeaveAsync(Guid leaveRequestId, CancellationToken cancellationToken = default)
    {
        if (leaveRequestId == FakeApplicationState.OtherEmployeeId)
        {
            throw new ForbiddenException("Managers can only review direct subordinate leave requests.");
        }

        if (_state.LeaveApproved)
        {
            throw new EMS.Domain.Exceptions.DomainException("Only pending leave requests can be approved.");
        }

        _state.LeaveApproved = true;
        return Task.FromResult(ToResponse(leaveRequestId, LeaveStatus.Approved, FakeApplicationState.ManagerId));
    }

    public Task<LeaveRequestResponse> CreateLeaveRequestAsync(CreateLeaveRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new FluentValidation.ValidationException(
                [new FluentValidation.Results.ValidationFailure(nameof(request.Reason), "Reason is required.")]);
        }

        return Task.FromResult(ToResponse(Guid.NewGuid(), LeaveStatus.Pending, null));
    }

    public Task<PagedResult<LeaveRequestResponse>> GetLeaveRequestsAsync(LeaveRequestQuery query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToPagedResult(query));
    }

    public Task<PagedResult<LeaveRequestResponse>> GetMyLeaveRequestsAsync(LeaveRequestQuery query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToPagedResult(query));
    }

    public Task<LeaveRequestResponse> RejectLeaveAsync(Guid leaveRequestId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ToResponse(leaveRequestId, LeaveStatus.Rejected, FakeApplicationState.ManagerId));
    }

    private static PagedResult<LeaveRequestResponse> ToPagedResult(LeaveRequestQuery query)
    {
        return new PagedResult<LeaveRequestResponse>(
            [ToResponse(Guid.NewGuid(), LeaveStatus.Pending, null)],
            query.Page,
            query.PageSize,
            1);
    }

    private static LeaveRequestResponse ToResponse(Guid id, LeaveStatus status, Guid? approvedById)
    {
        return new LeaveRequestResponse(
            id,
            FakeApplicationState.EmployeeId,
            "EMP-001",
            "Demo Employee",
            LeaveType.Annual,
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(1)),
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(2)),
            "Family event",
            status,
            approvedById,
            DateTime.UtcNow,
            approvedById.HasValue ? DateTime.UtcNow : null);
    }
}
