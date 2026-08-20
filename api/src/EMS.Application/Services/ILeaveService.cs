using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Leave;

namespace EMS.Application.Services;

public interface ILeaveService
{
    Task<LeaveRequestResponse> CreateLeaveRequestAsync(CreateLeaveRequestDto request, CancellationToken cancellationToken = default);

    Task<PagedResult<LeaveRequestResponse>> GetMyLeaveRequestsAsync(LeaveRequestQuery query, CancellationToken cancellationToken = default);

    Task<PagedResult<LeaveRequestResponse>> GetLeaveRequestsAsync(LeaveRequestQuery query, CancellationToken cancellationToken = default);

    Task<LeaveRequestResponse> ApproveLeaveAsync(Guid leaveRequestId, CancellationToken cancellationToken = default);

    Task<LeaveRequestResponse> RejectLeaveAsync(Guid leaveRequestId, CancellationToken cancellationToken = default);
}
