using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;
using EMS.Domain.Entities;

namespace EMS.Application.Abstractions.Persistence;

public interface IAttendanceRepository
{
    Task<AttendanceLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<AttendanceLog?> GetActiveByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken = default);

    Task<PagedResult<AttendanceLog>> GetPagedAsync(AttendanceQuery query, CancellationToken cancellationToken = default);

    Task AddAsync(AttendanceLog attendanceLog, CancellationToken cancellationToken = default);

    Task UpdateAsync(AttendanceLog attendanceLog, CancellationToken cancellationToken = default);
}
