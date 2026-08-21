using System.Net;
using System.Net.Http.Json;
using EMS.Application.DTOs.Attendance;
using EMS.Domain.Enums;

namespace EMS.IntegrationTests;

public sealed class AttendanceApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AttendanceApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AuthenticatedEmployee_CanCheckIn()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.PostAsJsonAsync("/api/v1/attendance/check-in", new CheckInRequest(DeviceType.Web));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task SecondActiveCheckIn_ReturnsConflict()
    {
        await using var factory = new CustomWebApplicationFactory();
        var client = CustomWebApplicationFactory.CreateClientWithRole(factory, EmployeeRole.Employee);

        await client.PostAsJsonAsync("/api/v1/attendance/check-in", new CheckInRequest(DeviceType.Web));
        var response = await client.PostAsJsonAsync("/api/v1/attendance/check-in", new CheckInRequest(DeviceType.Web));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Employee_CanCheckOut()
    {
        await using var factory = new CustomWebApplicationFactory();
        var client = CustomWebApplicationFactory.CreateClientWithRole(factory, EmployeeRole.Employee);
        await client.PostAsJsonAsync("/api/v1/attendance/check-in", new CheckInRequest(DeviceType.Web));

        var response = await client.PostAsync("/api/v1/attendance/check-out", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CheckOutWithoutActiveAttendance_ReturnsConflict()
    {
        await using var factory = new CustomWebApplicationFactory();
        var client = CustomWebApplicationFactory.CreateClientWithRole(factory, EmployeeRole.Employee);

        var response = await client.PostAsync("/api/v1/attendance/check-out", null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Employee_CanRetrieveOwnAttendance()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.GetAsync("/api/v1/attendance/me?page=1&pageSize=20");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UnauthenticatedCheckIn_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/attendance/check-in", new CheckInRequest(DeviceType.Web));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
