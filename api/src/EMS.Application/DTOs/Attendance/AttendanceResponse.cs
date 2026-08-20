using EMS.Domain.Enums;

namespace EMS.Application.DTOs.Attendance;

public sealed record AttendanceResponse(
    Guid Id,
    Guid EmployeeId,
    DateTime CheckInTime,
    DateTime? CheckOutTime,
    DateOnly WorkDate,
    AttendanceStatus Status,
    DeviceType DeviceType);
