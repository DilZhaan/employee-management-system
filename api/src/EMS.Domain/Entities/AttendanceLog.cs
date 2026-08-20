using EMS.Domain.Common;
using EMS.Domain.Enums;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Entities;

public sealed class AttendanceLog : AuditableEntity
{
    public AttendanceLog(
        Guid employeeId,
        DateTime checkInTime,
        AttendanceStatus status,
        DeviceType deviceType)
    {
        EmployeeId = RequireId(employeeId, nameof(employeeId));
        CheckInTime = EnsureUtc(checkInTime);
        WorkDate = DateOnly.FromDateTime(CheckInTime);
        Status = status;
        DeviceType = deviceType;
    }

    public Guid EmployeeId { get; private set; }

    public DateTime CheckInTime { get; private set; }

    public DateTime? CheckOutTime { get; private set; }

    public DateOnly WorkDate { get; private set; }

    public AttendanceStatus Status { get; private set; }

    public DeviceType DeviceType { get; private set; }

    public void CheckOut(DateTime checkOutTime)
    {
        if (CheckOutTime is not null)
        {
            throw new DomainException("Attendance has already been checked out.");
        }

        var utcCheckOutTime = EnsureUtc(checkOutTime);
        if (utcCheckOutTime <= CheckInTime)
        {
            throw new DomainException("Check-out time must be after check-in time.");
        }

        CheckOutTime = utcCheckOutTime;
        MarkUpdated();
    }

    private static Guid RequireId(Guid value, string parameterName)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException($"{parameterName} is required.");
        }

        return value;
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        if (value.Kind == DateTimeKind.Utc)
        {
            return value;
        }

        return value.ToUniversalTime();
    }
}
