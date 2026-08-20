using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Leave;

public sealed record CreateLeaveRequestDto(
    LeaveType LeaveType,
    DateOnly StartDate,
    DateOnly EndDate,
    string Reason);
