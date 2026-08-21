using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EMS.Application.Abstractions.Authentication;
using EMS.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EMS.Infrastructure.Authentication;

public sealed class JwtTokenService : ITokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string GenerateToken(Employee employee)
    {
        ValidateOptions();

        var now = DateTime.UtcNow;
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, employee.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, employee.Email),
            new Claim(ClaimTypes.Role, employee.Role.ToString()),
            new Claim("employee_id", employee.Id.ToString())
        };
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now,
            expires: now.AddMinutes(_options.ExpirationMinutes),
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void ValidateOptions()
    {
        if (string.IsNullOrWhiteSpace(_options.Secret) || Encoding.UTF8.GetByteCount(_options.Secret) < 32)
        {
            throw new InvalidOperationException("JWT secret must be at least 32 bytes.");
        }

        if (string.IsNullOrWhiteSpace(_options.Issuer))
        {
            throw new InvalidOperationException("JWT issuer is required.");
        }

        if (string.IsNullOrWhiteSpace(_options.Audience))
        {
            throw new InvalidOperationException("JWT audience is required.");
        }

        if (_options.ExpirationMinutes <= 0)
        {
            throw new InvalidOperationException("JWT expiration must be greater than zero.");
        }
    }
}
