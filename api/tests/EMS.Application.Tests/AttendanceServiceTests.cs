using EMS.Application.DTOs.Attendance;
using EMS.Application.Exceptions;
using EMS.Application.Services;
using EMS.Application.Validators.Attendance;
using EMS.Domain.Entities;
using EMS.Domain.Enums;

namespace EMS.Application.Tests;

public sealed class AttendanceServiceTests
{
    [Fact]
    public async Task CheckInAsync_WithAuthenticatedActiveEmployee_CreatesAttendance()
    {
        var fixture = CreateFixture();

        var response = await fixture.Service.CheckInAsync(new CheckInRequest(DeviceType.Mobile));

        Assert.Equal(fixture.Employee.Id, response.EmployeeId);
        Assert.Equal(DeviceType.Mobile, response.DeviceType);
        Assert.Equal(fixture.AttendancePolicy.Status, response.Status);
        Assert.NotNull(fixture.AttendancePolicy.ReceivedCheckInTime);
        Assert.Equal(fixture.AttendanceRepository.AddedAttendanceLog?.EmployeeId, fixture.Employee.Id);
    }

    [Fact]
    public async Task CheckInAsync_WithInactiveEmployee_ThrowsForbiddenException()
    {
        var fixture = CreateFixture();
        fixture.Employee.Deactivate();

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            fixture.Service.CheckInAsync(new CheckInRequest(DeviceType.Web)));
    }

    [Fact]
    public async Task CheckInAsync_WhenActiveAttendanceExists_ThrowsConflictException()
    {
        var fixture = CreateFixture();
        fixture.AttendanceRepository.AttendanceLogs.Add(new AttendanceLog(
            fixture.Employee.Id,
            DateTime.UtcNow.AddHours(-1),
            AttendanceStatus.Present,
            DeviceType.Web));

        await Assert.ThrowsAsync<ConflictException>(() =>
            fixture.Service.CheckInAsync(new CheckInRequest(DeviceType.Web)));
    }

    [Fact]
    public async Task CheckInAsync_UsesStatusFromAttendancePolicy()
    {
        var fixture = CreateFixture();
        fixture.AttendancePolicy.Status = AttendanceStatus.Late;

        var response = await fixture.Service.CheckInAsync(new CheckInRequest(DeviceType.Web));

        Assert.Equal(AttendanceStatus.Late, response.Status);
    }

    [Fact]
    public async Task CheckOutAsync_WithoutActiveAttendance_ThrowsNotFoundException()
    {
        var fixture = CreateFixture();

        await Assert.ThrowsAsync<NotFoundException>(() => fixture.Service.CheckOutAsync());
    }

    [Fact]
    public async Task CheckOutAsync_WithActiveAttendance_Succeeds()
    {
        var fixture = CreateFixture();
        var attendanceLog = new AttendanceLog(
            fixture.Employee.Id,
            DateTime.UtcNow.AddHours(-1),
            AttendanceStatus.Present,
            DeviceType.Web);
        fixture.AttendanceRepository.AttendanceLogs.Add(attendanceLog);

        var response = await fixture.Service.CheckOutAsync();

        Assert.NotNull(response.CheckOutTime);
        Assert.Equal(attendanceLog, fixture.AttendanceRepository.UpdatedAttendanceLog);
    }

    [Fact]
    public async Task GetMyAttendanceAsync_UsesCurrentUserEmployeeId()
    {
        var fixture = CreateFixture();
        var otherEmployee = TestEntities.Employee(fixture.Department.Id, email: "other@example.com", employeeCode: "EMP-002");
        fixture.EmployeeRepository.Employees.Add(otherEmployee);
        fixture.AttendanceRepository.AttendanceLogs.Add(new AttendanceLog(
            fixture.Employee.Id,
            DateTime.UtcNow.AddHours(-2),
            AttendanceStatus.Present,
            DeviceType.Web));
        fixture.AttendanceRepository.AttendanceLogs.Add(new AttendanceLog(
            otherEmployee.Id,
            DateTime.UtcNow.AddHours(-2),
            AttendanceStatus.Present,
            DeviceType.Web));

        var response = await fixture.Service.GetMyAttendanceAsync(new AttendanceQuery(EmployeeId: otherEmployee.Id));

        Assert.Single(response.Items);
        Assert.Equal(fixture.Employee.Id, response.Items.Single().EmployeeId);
    }

    private static AttendanceFixture CreateFixture()
    {
        var department = TestEntities.Department();
        var employee = TestEntities.Employee(department.Id);
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(employee);
        var attendanceRepository = new InMemoryAttendanceRepository();
        var currentUser = new TestCurrentUser
        {
            EmployeeId = employee.Id,
            Role = EmployeeRole.Employee,
            IsAuthenticated = true
        };
        var attendancePolicy = new FixedAttendancePolicy();
        var service = new AttendanceService(
            attendanceRepository,
            employeeRepository,
            attendancePolicy,
            currentUser,
            new CheckInRequestValidator(),
            new AttendanceQueryValidator());

        return new AttendanceFixture(
            service,
            department,
            employee,
            employeeRepository,
            attendanceRepository,
            attendancePolicy);
    }

    private sealed record AttendanceFixture(
        AttendanceService Service,
        Department Department,
        Employee Employee,
        InMemoryEmployeeRepository EmployeeRepository,
        InMemoryAttendanceRepository AttendanceRepository,
        FixedAttendancePolicy AttendancePolicy);
}
