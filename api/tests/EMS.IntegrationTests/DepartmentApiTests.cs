using System.Net;
using EMS.Domain.Enums;

namespace EMS.IntegrationTests;

public sealed class DepartmentApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private static readonly Guid DepartmentId = Guid.Parse("22222222-2222-4222-8222-222222222222");
    private readonly CustomWebApplicationFactory _factory;

    public DepartmentApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ActivateDepartment_ReturnsNoContent()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.PatchAsync($"/api/v1/departments/{DepartmentId}/activate", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Employee_CannotActivateDepartment()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.PatchAsync($"/api/v1/departments/{DepartmentId}/activate", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
