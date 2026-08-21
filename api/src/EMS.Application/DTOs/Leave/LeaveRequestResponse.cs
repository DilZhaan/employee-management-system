using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Leave;

public sealed record LeaveRequestResponse(
    Guid Id,
    Guid EmployeeId,
    string EmployeeCode,
    LeaveType LeaveType,
    DateOnly StartDate,
    DateOnly EndDate,
    string Reason,
    LeaveStatus Status,
    Guid? ApprovedById,
    DateTime AppliedOn,
    DateTime? ReviewedAt);
