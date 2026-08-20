using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;

namespace EMS.Application.Services;

public interface IAttendanceService
{
    Task<AttendanceResponse> CheckInAsync(CheckInRequest request, CancellationToken cancellationToken = default);

    Task<AttendanceResponse> CheckOutAsync(CancellationToken cancellationToken = default);

    Task<PagedResult<AttendanceResponse>> GetMyAttendanceAsync(AttendanceQuery query, CancellationToken cancellationToken = default);

    Task<PagedResult<AttendanceResponse>> GetAttendanceAsync(AttendanceQuery query, CancellationToken cancellationToken = default);
}
