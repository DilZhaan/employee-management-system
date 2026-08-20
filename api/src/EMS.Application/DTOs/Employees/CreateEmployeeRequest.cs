using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Employees;

public sealed record CreateEmployeeRequest(
    string EmployeeCode,
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? PhoneNumber,
    Guid DepartmentId,
    EmployeeRole Role,
    Guid? ManagerId);
