using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Leave;
using EMS.Domain.Entities;
using EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EMS.Infrastructure.Repositories;

public sealed class LeaveRequestRepository : ILeaveRequestRepository
{
    private readonly AppDbContext _dbContext;

    public LeaveRequestRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<LeaveRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.LeaveRequests.FirstOrDefaultAsync(leaveRequest => leaveRequest.Id == id, cancellationToken);
    }

    public async Task<PagedResult<LeaveRequest>> GetPagedAsync(
        LeaveRequestQuery query,
        CancellationToken cancellationToken = default)
    {
        var leaveRequests = _dbContext.LeaveRequests.AsNoTracking();

        if (query.EmployeeId.HasValue)
        {
            leaveRequests = leaveRequests.Where(leaveRequest => leaveRequest.EmployeeId == query.EmployeeId.Value);
        }

        if (query.DepartmentId.HasValue)
        {
            var employeeIds = _dbContext.Employees
                .Where(employee => employee.DepartmentId == query.DepartmentId.Value)
                .Select(employee => employee.Id);
            leaveRequests = leaveRequests.Where(leaveRequest => employeeIds.Contains(leaveRequest.EmployeeId));
        }

        if (query.Status.HasValue)
        {
            leaveRequests = leaveRequests.Where(leaveRequest => leaveRequest.Status == query.Status.Value);
        }

        if (query.From.HasValue)
        {
            leaveRequests = leaveRequests.Where(leaveRequest => leaveRequest.EndDate >= query.From.Value);
        }

        if (query.To.HasValue)
        {
            leaveRequests = leaveRequests.Where(leaveRequest => leaveRequest.StartDate <= query.To.Value);
        }

        var totalCount = await leaveRequests.CountAsync(cancellationToken);
        var items = await leaveRequests
            .OrderByDescending(leaveRequest => leaveRequest.AppliedOn)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<LeaveRequest>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task AddAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken = default)
    {
        await _dbContext.LeaveRequests.AddAsync(leaveRequest, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken = default)
    {
        _dbContext.LeaveRequests.Update(leaveRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
