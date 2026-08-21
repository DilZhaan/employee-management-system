using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using EMS.Domain.Entities;
using EMS.Domain.Enums;
using EMS.Infrastructure.Authentication;
using Microsoft.Extensions.Options;

namespace EMS.Infrastructure.Tests;

public sealed class JwtTokenServiceTests
{
    [Fact]
    public void GenerateToken_IncludesExpectedClaimsAndMetadata()
    {
        var options = new JwtOptions
        {
            Secret = "development-test-secret-value-32-bytes",
            Issuer = "EMS.Tests",
            Audience = "EMS.TestClients",
            ExpirationMinutes = 30
        };
        var service = new JwtTokenService(Options.Create(options));
        var employee = new Employee(
            "ADM-001",
            "Amina",
            "Perera",
            "admin@ems.local",
            "password-hash",
            null,
            Guid.NewGuid(),
            EmployeeRole.Admin);

        var tokenValue = service.GenerateToken(employee);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(tokenValue);

        Assert.Equal(options.Issuer, token.Issuer);
        Assert.Contains(options.Audience, token.Audiences);
        Assert.True(token.ValidTo > DateTime.UtcNow);
        Assert.Equal(employee.Id.ToString(), token.Claims.Single(claim => claim.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal(employee.Email, token.Claims.Single(claim => claim.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal(employee.Role.ToString(), token.Claims.Single(claim => claim.Type == ClaimTypes.Role).Value);
        Assert.Equal("HS256", token.Header.Alg);
    }

    [Fact]
    public void GenerateToken_WhenSecretIsTooShort_ThrowsInvalidOperationException()
    {
        var service = new JwtTokenService(Options.Create(new JwtOptions
        {
            Secret = "short",
            Issuer = "EMS.Tests",
            Audience = "EMS.TestClients",
            ExpirationMinutes = 30
        }));
        var employee = new Employee(
            "EMP-001",
            "Ada",
            "Lovelace",
            "ada@example.com",
            "password-hash",
            null,
            Guid.NewGuid(),
            EmployeeRole.Employee);

        Assert.Throws<InvalidOperationException>(() => service.GenerateToken(employee));
    }
}
