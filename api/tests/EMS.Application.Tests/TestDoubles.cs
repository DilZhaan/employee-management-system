using EMS.Application.Abstractions.Attendance;
using EMS.Application.Abstractions.Authentication;
using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Application.DTOs.Employees;
using EMS.Application.DTOs.Leave;
using EMS.Domain.Entities;
using EMS.Domain.Enums;

namespace EMS.Application.Tests;

internal sealed class InMemoryEmployeeRepository : IEmployeeRepository
{
    public List<Employee> Employees { get; } = [];

    public Employee? AddedEmployee { get; private set; }

    public Employee? UpdatedEmployee { get; private set; }

    public Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        AddedEmployee = employee;
        Employees.Add(employee);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsByEmailAsync(
        string email,
        Guid? excludedEmployeeId = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Employees.Any(employee =>
            employee.Email.Equals(email, StringComparison.OrdinalIgnoreCase)
            && employee.Id != excludedEmployeeId));
    }

    public Task<bool> ExistsByEmployeeCodeAsync(
        string employeeCode,
        Guid? excludedEmployeeId = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Employees.Any(employee =>
            employee.EmployeeCode.Equals(employeeCode, StringComparison.OrdinalIgnoreCase)
            && employee.Id != excludedEmployeeId));
    }

    public Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Employees.FirstOrDefault(employee =>
            employee.Email.Equals(email, StringComparison.OrdinalIgnoreCase)));
    }

    public Task<Employee?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Employees.FirstOrDefault(employee =>
            employee.EmployeeCode.Equals(employeeCode, StringComparison.OrdinalIgnoreCase)));
    }

    public Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Employees.FirstOrDefault(employee => employee.Id == id));
    }

    public Task<PagedResult<Employee>> GetPagedAsync(EmployeeQuery query, CancellationToken cancellationToken = default)
    {
        var employees = Employees.AsEnumerable();

        if (query.DepartmentId.HasValue)
        {
            employees = employees.Where(employee => employee.DepartmentId == query.DepartmentId.Value);
        }

        if (query.ManagerId.HasValue)
        {
            employees = employees.Where(employee => employee.ManagerId == query.ManagerId.Value);
        }

        if (query.Role.HasValue)
        {
            employees = employees.Where(employee => employee.Role == query.Role.Value);
        }

        if (query.IsActive.HasValue)
        {
            employees = employees.Where(employee => employee.IsActive == query.IsActive.Value);
        }

        var items = employees.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToArray();
        return Task.FromResult(new PagedResult<Employee>(items, query.Page, query.PageSize, Employees.Count));
    }

    public Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        UpdatedEmployee = employee;
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryDepartmentRepository : IDepartmentRepository
{
    public List<Department> Departments { get; } = [];

    public Department? UpdatedDepartment { get; private set; }

    public Task AddAsync(Department department, CancellationToken cancellationToken = default)
    {
        Departments.Add(department);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsByCodeAsync(
        string code,
        Guid? excludedDepartmentId = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Departments.Any(department =>
            department.Code.Equals(code, StringComparison.OrdinalIgnoreCase)
            && department.Id != excludedDepartmentId));
    }

    public Task<Department?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Departments.FirstOrDefault(department =>
            department.Code.Equals(code, StringComparison.OrdinalIgnoreCase)));
    }

    public Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Departments.FirstOrDefault(department => department.Id == id));
    }

    public Task<PagedResult<Department>> GetPagedAsync(DepartmentQuery query, CancellationToken cancellationToken = default)
    {
        var departments = Departments.AsEnumerable();
        if (query.IsActive.HasValue)
        {
            departments = departments.Where(department => department.IsActive == query.IsActive.Value);
        }

        var items = departments.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToArray();
        return Task.FromResult(new PagedResult<Department>(items, query.Page, query.PageSize, Departments.Count));
    }

    public Task UpdateAsync(Department department, CancellationToken cancellationToken = default)
    {
        UpdatedDepartment = department;
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryAttendanceRepository : IAttendanceRepository
{
    public List<AttendanceLog> AttendanceLogs { get; } = [];

    public AttendanceLog? AddedAttendanceLog { get; private set; }

    public AttendanceLog? UpdatedAttendanceLog { get; private set; }

    public Task AddAsync(AttendanceLog attendanceLog, CancellationToken cancellationToken = default)
    {
        AddedAttendanceLog = attendanceLog;
        AttendanceLogs.Add(attendanceLog);
        return Task.CompletedTask;
    }

    public Task<AttendanceLog?> GetActiveByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(AttendanceLogs.FirstOrDefault(attendanceLog =>
            attendanceLog.EmployeeId == employeeId && attendanceLog.CheckOutTime is null));
    }

    public Task<AttendanceLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(AttendanceLogs.FirstOrDefault(attendanceLog => attendanceLog.Id == id));
    }

    public Task<PagedResult<AttendanceLog>> GetPagedAsync(AttendanceQuery query, CancellationToken cancellationToken = default)
    {
        var attendanceLogs = AttendanceLogs.AsEnumerable();
        if (query.EmployeeId.HasValue)
        {
            attendanceLogs = attendanceLogs.Where(attendanceLog => attendanceLog.EmployeeId == query.EmployeeId.Value);
        }

        var items = attendanceLogs.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToArray();
        return Task.FromResult(new PagedResult<AttendanceLog>(items, query.Page, query.PageSize, AttendanceLogs.Count));
    }

    public Task UpdateAsync(AttendanceLog attendanceLog, CancellationToken cancellationToken = default)
    {
        UpdatedAttendanceLog = attendanceLog;
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryLeaveRequestRepository : ILeaveRequestRepository
{
    public List<LeaveRequest> LeaveRequests { get; } = [];

    public LeaveRequest? AddedLeaveRequest { get; private set; }

    public LeaveRequest? UpdatedLeaveRequest { get; private set; }

    public Task AddAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken = default)
    {
        AddedLeaveRequest = leaveRequest;
        LeaveRequests.Add(leaveRequest);
        return Task.CompletedTask;
    }

    public Task<LeaveRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(LeaveRequests.FirstOrDefault(leaveRequest => leaveRequest.Id == id));
    }

    public Task<PagedResult<LeaveRequest>> GetPagedAsync(LeaveRequestQuery query, CancellationToken cancellationToken = default)
    {
        var leaveRequests = LeaveRequests.AsEnumerable();
        if (query.EmployeeId.HasValue)
        {
            leaveRequests = leaveRequests.Where(leaveRequest => leaveRequest.EmployeeId == query.EmployeeId.Value);
        }

        if (query.Status.HasValue)
        {
            leaveRequests = leaveRequests.Where(leaveRequest => leaveRequest.Status == query.Status.Value);
        }

        var items = leaveRequests.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToArray();
        return Task.FromResult(new PagedResult<LeaveRequest>(items, query.Page, query.PageSize, LeaveRequests.Count));
    }

    public Task UpdateAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken = default)
    {
        UpdatedLeaveRequest = leaveRequest;
        return Task.CompletedTask;
    }
}

internal sealed class RecordingPasswordHasher : IPasswordHasher
{
    public string? HashedPassword { get; private set; }

    public string? VerifiedPassword { get; private set; }

    public string? VerifiedHash { get; private set; }

    public bool VerificationResult { get; set; } = true;

    public string Hash(string password)
    {
        HashedPassword = password;
        return $"hashed:{password}";
    }

    public bool Verify(string password, string passwordHash)
    {
        VerifiedPassword = password;
        VerifiedHash = passwordHash;
        return VerificationResult;
    }
}

internal sealed class RecordingTokenService : ITokenService
{
    public Employee? Employee { get; private set; }

    public string Token { get; set; } = "token-value";

    public string GenerateToken(Employee employee)
    {
        Employee = employee;
        return Token;
    }
}

internal sealed class TestCurrentUser : ICurrentUser
{
    public Guid? EmployeeId { get; set; }

    public EmployeeRole? Role { get; set; }

    public bool IsAuthenticated { get; set; }
}

internal sealed class FixedAttendancePolicy : IAttendancePolicy
{
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;

    public DateTime? ReceivedCheckInTime { get; private set; }

    public AttendanceStatus DetermineStatus(DateTime checkInTime)
    {
        ReceivedCheckInTime = checkInTime;
        return Status;
    }
}

internal static class TestEntities
{
    public static Department Department(string name = "Engineering", string code = "ENG")
    {
        return new Department(name, code);
    }

    public static Employee Employee(
        Guid departmentId,
        EmployeeRole role = EmployeeRole.Employee,
        Guid? managerId = null,
        string email = "employee@example.com",
        string employeeCode = "EMP-001")
    {
        return new Employee(
            employeeCode,
            "Ada",
            "Lovelace",
            email,
            "hashed-password",
            "+94111222333",
            departmentId,
            role,
            managerId);
    }
}
