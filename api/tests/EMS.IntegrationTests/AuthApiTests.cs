using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using EMS.Application.DTOs.Auth;
using EMS.Domain.Enums;

namespace EMS.IntegrationTests;

public sealed class AuthApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public AuthApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsJwt()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@ems.local", "password"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        Assert.False(string.IsNullOrWhiteSpace(body?.Token));
        Assert.Equal(EmployeeRole.Admin, body.Employee.Role);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("bad@example.com", "wrong"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/employees");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithInvalidToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "invalid-token");

        var response = await client.GetAsync("/api/v1/employees");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithExpiredToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var token = CustomWebApplicationFactory.CreateToken(
            FakeApplicationState.EmployeeId,
            EmployeeRole.Employee,
            "employee@ems.local",
            DateTime.UtcNow.AddMinutes(-5));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/attendance/me?page=1&pageSize=20");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task EmployeeToken_ForAdminEndpoint_ReturnsForbidden()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Employee);

        var response = await client.GetAsync("/api/v1/employees");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AdminToken_ForAdminEndpoint_ReturnsOk()
    {
        var client = CustomWebApplicationFactory.CreateClientWithRole(_factory, EmployeeRole.Admin);

        var response = await client.GetAsync("/api/v1/employees");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
