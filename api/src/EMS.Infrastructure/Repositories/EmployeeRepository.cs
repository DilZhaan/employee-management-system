using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Employees;
using EMS.Domain.Entities;
using EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EMS.Infrastructure.Repositories;

public sealed class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _dbContext;

    public EmployeeRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Employees.FirstOrDefaultAsync(employee => employee.Id == id, cancellationToken);
    }

    public Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(employee => employee.Email == email, cancellationToken);
    }

    public Task<Employee?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(employee => employee.EmployeeCode == employeeCode, cancellationToken);
    }

    public Task<bool> ExistsByEmailAsync(
        string email,
        Guid? excludedEmployeeId = null,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.Employees.AnyAsync(
            employee => employee.Email == email && (!excludedEmployeeId.HasValue || employee.Id != excludedEmployeeId.Value),
            cancellationToken);
    }

    public Task<bool> ExistsByEmployeeCodeAsync(
        string employeeCode,
        Guid? excludedEmployeeId = null,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.Employees.AnyAsync(
            employee => employee.EmployeeCode == employeeCode
                && (!excludedEmployeeId.HasValue || employee.Id != excludedEmployeeId.Value),
            cancellationToken);
    }

    public async Task<PagedResult<Employee>> GetPagedAsync(
        EmployeeQuery query,
        CancellationToken cancellationToken = default)
    {
        var employees = _dbContext.Employees.AsNoTracking();

        if (query.DepartmentId.HasValue)
        {
            employees = employees.Where(employee => employee.DepartmentId == query.DepartmentId.Value);
        }

        if (query.ManagerId.HasValue)
        {
            employees = employees.Where(employee => employee.ManagerId == query.ManagerId.Value);
        }

        if (query.Role.HasValue)
        {
            employees = employees.Where(employee => employee.Role == query.Role.Value);
        }

        if (query.IsActive.HasValue)
        {
            employees = employees.Where(employee => employee.IsActive == query.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLowerInvariant();
            employees = employees.Where(employee =>
                employee.EmployeeCode.ToLower().Contains(search)
                || employee.FirstName.ToLower().Contains(search)
                || employee.LastName.ToLower().Contains(search)
                || employee.Email.ToLower().Contains(search));
        }

        var totalCount = await employees.CountAsync(cancellationToken);
        var items = await employees
            .OrderBy(employee => employee.EmployeeCode)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Employee>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        await _dbContext.Employees.AddAsync(employee, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        _dbContext.Employees.Update(employee);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
