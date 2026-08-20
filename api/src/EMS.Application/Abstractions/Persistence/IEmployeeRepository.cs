using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Employees;
using EMS.Domain.Entities;

namespace EMS.Application.Abstractions.Persistence;

public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<Employee?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(string email, Guid? excludedEmployeeId = null, CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmployeeCodeAsync(string employeeCode, Guid? excludedEmployeeId = null, CancellationToken cancellationToken = default);

    Task<PagedResult<Employee>> GetPagedAsync(EmployeeQuery query, CancellationToken cancellationToken = default);

    Task AddAsync(Employee employee, CancellationToken cancellationToken = default);

    Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default);
}
