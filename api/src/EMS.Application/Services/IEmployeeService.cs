using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Employees;

namespace EMS.Application.Services;

public interface IEmployeeService
{
    Task<EmployeeResponse> CreateEmployeeAsync(CreateEmployeeRequest request, CancellationToken cancellationToken = default);

    Task<EmployeeResponse> GetEmployeeByIdAsync(Guid employeeId, CancellationToken cancellationToken = default);

    Task<PagedResult<EmployeeResponse>> GetEmployeesAsync(EmployeeQuery query, CancellationToken cancellationToken = default);

    Task<EmployeeResponse> UpdateEmployeeAsync(Guid employeeId, UpdateEmployeeRequest request, CancellationToken cancellationToken = default);

    Task DeactivateEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default);
}
