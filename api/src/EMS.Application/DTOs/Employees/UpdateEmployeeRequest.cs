using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Employees;

public sealed record UpdateEmployeeRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    Guid DepartmentId,
    EmployeeRole Role,
    Guid? ManagerId);
