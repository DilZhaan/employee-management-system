using System.Net;

namespace EMS.IntegrationTests;

public sealed class HealthApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public HealthApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task HealthEndpoint_IsMapped()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.NotEqual(HttpStatusCode.NotFound, response.StatusCode);
    }
}
