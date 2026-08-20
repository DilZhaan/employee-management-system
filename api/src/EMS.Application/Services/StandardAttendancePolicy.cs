using EMS.Application.Abstractions.Attendance;
using EMS.Domain.Enums;

namespace EMS.Application.Services;

public sealed class StandardAttendancePolicy : IAttendancePolicy
{
    private static readonly TimeOnly LateThreshold = new(9, 0);
    private readonly TimeZoneInfo _businessTimeZone;

    public StandardAttendancePolicy()
        : this(TimeZoneInfo.Local)
    {
    }

    public StandardAttendancePolicy(TimeZoneInfo businessTimeZone)
    {
        _businessTimeZone = businessTimeZone;
    }

    public AttendanceStatus DetermineStatus(DateTime checkInTime)
    {
        var utcCheckInTime = checkInTime.Kind == DateTimeKind.Utc
            ? checkInTime
            : checkInTime.ToUniversalTime();
        var businessCheckInTime = TimeZoneInfo.ConvertTimeFromUtc(utcCheckInTime, _businessTimeZone);

        return TimeOnly.FromDateTime(businessCheckInTime) <= LateThreshold
            ? AttendanceStatus.Present
            : AttendanceStatus.Late;
    }
}
