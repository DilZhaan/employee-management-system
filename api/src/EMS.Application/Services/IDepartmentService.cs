using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;

namespace EMS.Application.Services;

public interface IDepartmentService
{
    Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request, CancellationToken cancellationToken = default);

    Task<DepartmentResponse> GetDepartmentByIdAsync(Guid departmentId, CancellationToken cancellationToken = default);

    Task<PagedResult<DepartmentResponse>> GetDepartmentsAsync(DepartmentQuery query, CancellationToken cancellationToken = default);

    Task<DepartmentResponse> UpdateDepartmentAsync(Guid departmentId, UpdateDepartmentRequest request, CancellationToken cancellationToken = default);

    Task DeactivateDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default);
}
