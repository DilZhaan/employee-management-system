using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Employees;

public sealed record EmployeeQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? DepartmentId = null,
    Guid? ManagerId = null,
    EmployeeRole? Role = null,
    bool? IsActive = null,
    string? Search = null);
