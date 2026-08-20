using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Employees;

public sealed record EmployeeResponse(
    Guid Id,
    string EmployeeCode,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    Guid DepartmentId,
    EmployeeRole Role,
    Guid? ManagerId,
    bool IsActive,
    DateTime CreatedAt);
