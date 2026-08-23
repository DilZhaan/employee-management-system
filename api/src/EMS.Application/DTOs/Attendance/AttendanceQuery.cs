namespace EMS.Application.DTOs.Attendance;

public sealed record AttendanceQuery(
    int Page = 1,
    int PageSize = 20,
    DateOnly? From = null,
    DateOnly? To = null,
    Guid? DepartmentId = null,
    Guid? EmployeeId = null,
    string? EmployeeSearch = null);
