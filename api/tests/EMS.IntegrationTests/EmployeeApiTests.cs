using System.Net;
using System.Net.Http.Json;
using EMS.Application.DTOs.Employees;
using EMS.Domain.Enums;

namespace EMS.IntegrationTests;

public sealed class EmployeeApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public EmployeeApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Admin_CanCreateEmployee()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.PostAsJsonAsync("/api/v1/employees", CreateRequest("new@example.com"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Employee_CannotCreateEmployee()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.PostAsJsonAsync("/api/v1/employees", CreateRequest("blocked@example.com"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DuplicateEmail_ReturnsConflict()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.PostAsJsonAsync("/api/v1/employees", CreateRequest("duplicate@example.com"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task InvalidRequest_ReturnsBadRequest()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.PostAsJsonAsync("/api/v1/employees", CreateRequest("invalid-email"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Admin_CanRetrieveEmployee()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.GetAsync($"/api/v1/employees/{FakeApplicationState.EmployeeId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task MissingEmployee_ReturnsNotFound()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.GetAsync($"/api/v1/employees/{Guid.Empty}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeactivateEmployee_ReturnsNoContent()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.DeleteAsync($"/api/v1/employees/{FakeApplicationState.EmployeeId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ActivateEmployee_ReturnsNoContent()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.PatchAsync($"/api/v1/employees/{FakeApplicationState.EmployeeId}/activate", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private static CreateEmployeeRequest CreateRequest(string email)
    {
        return new CreateEmployeeRequest(
            "EMP-900",
            "Grace",
            "Hopper",
            email,
            "Password123!",
            null,
            Guid.NewGuid(),
            EmployeeRole.Employee,
            null);
    }
}
