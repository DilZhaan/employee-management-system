using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Application.Exceptions;
using EMS.Application.Mapping;
using EMS.Domain.Entities;
using FluentValidation;

namespace EMS.Application.Services;

public sealed class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IValidator<CreateDepartmentRequest> _createValidator;
    private readonly IValidator<UpdateDepartmentRequest> _updateValidator;
    private readonly IValidator<DepartmentQuery> _queryValidator;

    public DepartmentService(
        IDepartmentRepository departmentRepository,
        IValidator<CreateDepartmentRequest> createValidator,
        IValidator<UpdateDepartmentRequest> updateValidator,
        IValidator<DepartmentQuery> queryValidator)
    {
        _departmentRepository = departmentRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _queryValidator = queryValidator;
    }

    public async Task<DepartmentResponse> CreateDepartmentAsync(
        CreateDepartmentRequest request,
        CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var code = request.Code.Trim();
        if (await _departmentRepository.ExistsByCodeAsync(code, null, cancellationToken))
        {
            throw new ConflictException("Department code already exists.");
        }

        var department = new Department(request.Name, code);
        await _departmentRepository.AddAsync(department, cancellationToken);
        return department.ToResponse();
    }

    public async Task<DepartmentResponse> GetDepartmentByIdAsync(
        Guid departmentId,
        CancellationToken cancellationToken = default)
    {
        var department = await GetDepartmentAsync(departmentId, cancellationToken);
        return department.ToResponse();
    }

    public async Task<PagedResult<DepartmentResponse>> GetDepartmentsAsync(
        DepartmentQuery query,
        CancellationToken cancellationToken = default)
    {
        await _queryValidator.ValidateAndThrowAsync(query, cancellationToken);

        var departments = await _departmentRepository.GetPagedAsync(query, cancellationToken);
        return departments.MapItems(department => department.ToResponse());
    }

    public async Task<DepartmentResponse> UpdateDepartmentAsync(
        Guid departmentId,
        UpdateDepartmentRequest request,
        CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var department = await GetDepartmentAsync(departmentId, cancellationToken);
        var code = request.Code.Trim();

        if (await _departmentRepository.ExistsByCodeAsync(code, departmentId, cancellationToken))
        {
            throw new ConflictException("Department code already exists.");
        }

        department.UpdateDetails(request.Name, code);
        await _departmentRepository.UpdateAsync(department, cancellationToken);
        return department.ToResponse();
    }

    public async Task DeactivateDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default)
    {
        var department = await GetDepartmentAsync(departmentId, cancellationToken);
        department.Deactivate();
        await _departmentRepository.UpdateAsync(department, cancellationToken);
    }

    private async Task<Department> GetDepartmentAsync(Guid departmentId, CancellationToken cancellationToken)
    {
        var department = await _departmentRepository.GetByIdAsync(departmentId, cancellationToken);
        if (department is null)
        {
            throw new NotFoundException("Department was not found.");
        }

        return department;
    }
}
