using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using EMS.Application.Abstractions.Authentication;
using EMS.Domain.Enums;

namespace EMS.Api.Authentication;

public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? EmployeeId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var employeeId = user?.FindFirstValue("employee_id")
                ?? user?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? user?.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(employeeId, out var parsedEmployeeId) ? parsedEmployeeId : null;
        }
    }

    public EmployeeRole? Role
    {
        get
        {
            var role = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<EmployeeRole>(role, ignoreCase: true, out var parsedRole) ? parsedRole : null;
        }
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;
}
