using EMS.Domain.Enums;

namespace EMS.Application.Abstractions.Authentication;

public interface ICurrentUser
{
    Guid? EmployeeId { get; }

    EmployeeRole? Role { get; }

    bool IsAuthenticated { get; }
}
