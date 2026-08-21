using System.Net;
using System.Net.Http.Json;
using EMS.Application.DTOs.Leave;
using EMS.Domain.Enums;

namespace EMS.IntegrationTests;

public sealed class LeaveApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public LeaveApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Employee_CanCreateOwnLeave()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.PostAsJsonAsync("/api/v1/leave-requests", CreateRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Employee_CanViewOwnLeave()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.GetAsync("/api/v1/leave-requests/me?page=1&pageSize=20");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Employee_CannotApproveLeave()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.PatchAsync($"/api/v1/leave-requests/{Guid.NewGuid()}/approve", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Manager_CanApproveDirectSubordinateLeave()
    {
        await using var factory = new CustomWebApplicationFactory();
        var client = CustomWebApplicationFactory.CreateClientWithRole(factory, EmployeeRole.Manager);

        var response = await client.PatchAsync($"/api/v1/leave-requests/{Guid.NewGuid()}/approve", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Manager_CannotApproveUnrelatedEmployeeLeave()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Manager);

        var response = await client.PatchAsync($"/api/v1/leave-requests/{FakeApplicationState.OtherEmployeeId}/approve", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Admin_CanApproveValidPendingLeave()
    {
        await using var factory = new CustomWebApplicationFactory();
        var client = CustomWebApplicationFactory.CreateClientWithRole(factory, EmployeeRole.Admin);

        var response = await client.PatchAsync($"/api/v1/leave-requests/{Guid.NewGuid()}/approve", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task RepeatedApproval_ReturnsBadRequest()
    {
        await using var factory = new CustomWebApplicationFactory();
        var client = CustomWebApplicationFactory.CreateClientWithRole(factory, EmployeeRole.Admin);
        var id = Guid.NewGuid();

        await client.PatchAsync($"/api/v1/leave-requests/{id}/approve", null);
        var response = await client.PatchAsync($"/api/v1/leave-requests/{id}/approve", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EmptyLeaveReason_ReturnsBadRequest()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.PostAsJsonAsync(
            "/api/v1/leave-requests",
            CreateRequest(reason: ""));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static CreateLeaveRequestDto CreateRequest(string reason = "Family event")
    {
        return new CreateLeaveRequestDto(
            LeaveType.Annual,
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(1)),
            DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(2)),
            reason);
    }
}
