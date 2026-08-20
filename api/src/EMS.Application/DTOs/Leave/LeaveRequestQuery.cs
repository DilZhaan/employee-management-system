using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Leave;

public sealed record LeaveRequestQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? EmployeeId = null,
    Guid? DepartmentId = null,
    LeaveStatus? Status = null,
    DateOnly? From = null,
    DateOnly? To = null);
