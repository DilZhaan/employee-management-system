namespace EMS.Application.DTOs.Departments;

public sealed record DepartmentResponse(
    Guid Id,
    string Name,
    string Code,
    bool IsActive,
    DateTime CreatedAt);
