namespace EMS.Application.DTOs.Departments;

public sealed record DepartmentQuery(
    int Page = 1,
    int PageSize = 20,
    bool? IsActive = null,
    string? Search = null);
