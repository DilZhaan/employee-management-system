using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;
using EMS.Domain.Entities;
using EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EMS.Infrastructure.Repositories;

public sealed class AttendanceRepository : IAttendanceRepository
{
    private readonly AppDbContext _dbContext;

    public AttendanceRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<AttendanceLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.AttendanceLogs.FirstOrDefaultAsync(attendanceLog => attendanceLog.Id == id, cancellationToken);
    }

    public Task<AttendanceLog?> GetActiveByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return _dbContext.AttendanceLogs.FirstOrDefaultAsync(
            attendanceLog => attendanceLog.EmployeeId == employeeId && attendanceLog.CheckOutTime == null,
            cancellationToken);
    }

    public async Task<PagedResult<AttendanceLog>> GetPagedAsync(
        AttendanceQuery query,
        CancellationToken cancellationToken = default)
    {
        var attendanceLogs = _dbContext.AttendanceLogs.AsNoTracking();

        if (query.EmployeeId.HasValue)
        {
            attendanceLogs = attendanceLogs.Where(attendanceLog => attendanceLog.EmployeeId == query.EmployeeId.Value);
        }

        if (query.DepartmentId.HasValue)
        {
            var employeeIds = _dbContext.Employees
                .Where(employee => employee.DepartmentId == query.DepartmentId.Value)
                .Select(employee => employee.Id);
            attendanceLogs = attendanceLogs.Where(attendanceLog => employeeIds.Contains(attendanceLog.EmployeeId));
        }

        if (query.From.HasValue)
        {
            attendanceLogs = attendanceLogs.Where(attendanceLog => attendanceLog.WorkDate >= query.From.Value);
        }

        if (query.To.HasValue)
        {
            attendanceLogs = attendanceLogs.Where(attendanceLog => attendanceLog.WorkDate <= query.To.Value);
        }

        var totalCount = await attendanceLogs.CountAsync(cancellationToken);
        var items = await attendanceLogs
            .OrderByDescending(attendanceLog => attendanceLog.WorkDate)
            .ThenByDescending(attendanceLog => attendanceLog.CheckInTime)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AttendanceLog>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task AddAsync(AttendanceLog attendanceLog, CancellationToken cancellationToken = default)
    {
        await _dbContext.AttendanceLogs.AddAsync(attendanceLog, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(AttendanceLog attendanceLog, CancellationToken cancellationToken = default)
    {
        _dbContext.AttendanceLogs.Update(attendanceLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
