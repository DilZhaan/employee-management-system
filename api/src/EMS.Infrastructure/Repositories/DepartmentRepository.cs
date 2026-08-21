using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Domain.Entities;
using EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EMS.Infrastructure.Repositories;

public sealed class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _dbContext;

    public DepartmentRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Departments.FirstOrDefaultAsync(department => department.Id == id, cancellationToken);
    }

    public Task<Department?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return _dbContext.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(department => department.Code == code, cancellationToken);
    }

    public Task<bool> ExistsByCodeAsync(
        string code,
        Guid? excludedDepartmentId = null,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.Departments.AnyAsync(
            department => department.Code == code
                && (!excludedDepartmentId.HasValue || department.Id != excludedDepartmentId.Value),
            cancellationToken);
    }

    public async Task<PagedResult<Department>> GetPagedAsync(
        DepartmentQuery query,
        CancellationToken cancellationToken = default)
    {
        var departments = _dbContext.Departments.AsNoTracking();

        if (query.IsActive.HasValue)
        {
            departments = departments.Where(department => department.IsActive == query.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLowerInvariant();
            departments = departments.Where(department =>
                department.Name.ToLower().Contains(search) || department.Code.ToLower().Contains(search));
        }

        var totalCount = await departments.CountAsync(cancellationToken);
        var items = await departments
            .OrderBy(department => department.Code)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Department>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task AddAsync(Department department, CancellationToken cancellationToken = default)
    {
        await _dbContext.Departments.AddAsync(department, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Department department, CancellationToken cancellationToken = default)
    {
        _dbContext.Departments.Update(department);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
