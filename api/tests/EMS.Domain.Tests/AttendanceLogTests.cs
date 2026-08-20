using EMS.Domain.Entities;
using EMS.Domain.Enums;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Tests;

public sealed class AttendanceLogTests
{
    [Fact]
    public void Create_WithValidValues_ProducesOpenRecord()
    {
        var checkInTime = new DateTime(2026, 8, 20, 4, 30, 0, DateTimeKind.Utc);

        var attendanceLog = new AttendanceLog(
            Guid.NewGuid(),
            checkInTime,
            AttendanceStatus.Present,
            DeviceType.Web);

        Assert.NotEqual(Guid.Empty, attendanceLog.Id);
        Assert.Equal(checkInTime, attendanceLog.CheckInTime);
        Assert.Null(attendanceLog.CheckOutTime);
        Assert.Equal(DateOnly.FromDateTime(checkInTime), attendanceLog.WorkDate);
        Assert.Equal(AttendanceStatus.Present, attendanceLog.Status);
        Assert.Equal(DeviceType.Web, attendanceLog.DeviceType);
    }

    [Fact]
    public void CheckOut_WithValidTime_Succeeds()
    {
        var checkInTime = new DateTime(2026, 8, 20, 4, 30, 0, DateTimeKind.Utc);
        var attendanceLog = new AttendanceLog(
            Guid.NewGuid(),
            checkInTime,
            AttendanceStatus.Present,
            DeviceType.Mobile);

        var checkOutTime = checkInTime.AddHours(8);
        attendanceLog.CheckOut(checkOutTime);

        Assert.Equal(checkOutTime, attendanceLog.CheckOutTime);
        Assert.NotNull(attendanceLog.UpdatedAt);
    }

    [Fact]
    public void CheckOut_WhenAlreadyCheckedOut_ThrowsDomainException()
    {
        var checkInTime = new DateTime(2026, 8, 20, 4, 30, 0, DateTimeKind.Utc);
        var attendanceLog = new AttendanceLog(
            Guid.NewGuid(),
            checkInTime,
            AttendanceStatus.Present,
            DeviceType.Web);

        attendanceLog.CheckOut(checkInTime.AddHours(8));

        Assert.Throws<DomainException>(() => attendanceLog.CheckOut(checkInTime.AddHours(9)));
    }

    [Fact]
    public void CheckOut_WhenBeforeCheckIn_ThrowsDomainException()
    {
        var checkInTime = new DateTime(2026, 8, 20, 4, 30, 0, DateTimeKind.Utc);
        var attendanceLog = new AttendanceLog(
            Guid.NewGuid(),
            checkInTime,
            AttendanceStatus.Present,
            DeviceType.Web);

        Assert.Throws<DomainException>(() => attendanceLog.CheckOut(checkInTime.AddMinutes(-1)));
    }
}
