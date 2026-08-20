using EMS.Domain.Enums;

namespace EMS.Application.Abstractions.Attendance;

public interface IAttendancePolicy
{
    AttendanceStatus DetermineStatus(DateTime checkInTime);
}
