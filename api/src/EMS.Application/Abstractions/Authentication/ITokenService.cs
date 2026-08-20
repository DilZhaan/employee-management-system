using EMS.Domain.Entities;

namespace EMS.Application.Abstractions.Authentication;

public interface ITokenService
{
    string GenerateToken(Employee employee);
}
