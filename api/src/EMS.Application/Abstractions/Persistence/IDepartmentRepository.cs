using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Domain.Entities;

namespace EMS.Application.Abstractions.Persistence;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Department?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    Task<bool> ExistsByCodeAsync(string code, Guid? excludedDepartmentId = null, CancellationToken cancellationToken = default);

    Task<PagedResult<Department>> GetPagedAsync(DepartmentQuery query, CancellationToken cancellationToken = default);

    Task AddAsync(Department department, CancellationToken cancellationToken = default);

    Task UpdateAsync(Department department, CancellationToken cancellationToken = default);
}
