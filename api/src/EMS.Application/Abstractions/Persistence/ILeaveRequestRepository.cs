using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Leave;
using EMS.Domain.Entities;

namespace EMS.Application.Abstractions.Persistence;

public interface ILeaveRequestRepository
{
    Task<LeaveRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<LeaveRequest>> GetPagedAsync(LeaveRequestQuery query, CancellationToken cancellationToken = default);

    Task AddAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken = default);

    Task UpdateAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken = default);
}
