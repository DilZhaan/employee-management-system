using EMS.Application.Abstractions.Authentication;
using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Employees;
using EMS.Application.Exceptions;
using EMS.Application.Mapping;
using EMS.Domain.Entities;
using FluentValidation;

namespace EMS.Application.Services;

public sealed class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IValidator<CreateEmployeeRequest> _createValidator;
    private readonly IValidator<UpdateEmployeeRequest> _updateValidator;
    private readonly IValidator<EmployeeQuery> _queryValidator;

    public EmployeeService(
        IEmployeeRepository employeeRepository,
        IDepartmentRepository departmentRepository,
        IPasswordHasher passwordHasher,
        IValidator<CreateEmployeeRequest> createValidator,
        IValidator<UpdateEmployeeRequest> updateValidator,
        IValidator<EmployeeQuery> queryValidator)
    {
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        _passwordHasher = passwordHasher;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _queryValidator = queryValidator;
    }

    public async Task<EmployeeResponse> CreateEmployeeAsync(
        CreateEmployeeRequest request,
        CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var email = NormalizeEmail(request.Email);
        var employeeCode = request.EmployeeCode.Trim();

        if (await _employeeRepository.ExistsByEmailAsync(email, null, cancellationToken))
        {
            throw new ConflictException("Employee email already exists.");
        }

        if (await _employeeRepository.ExistsByEmployeeCodeAsync(employeeCode, null, cancellationToken))
        {
            throw new ConflictException("Employee code already exists.");
        }

        await EnsureActiveDepartmentAsync(request.DepartmentId, cancellationToken);
        await EnsureManagerExistsAsync(request.ManagerId, cancellationToken);

        var passwordHash = _passwordHasher.Hash(request.Password);
        var employee = new Employee(
            employeeCode,
            request.FirstName,
            request.LastName,
            email,
            passwordHash,
            request.PhoneNumber,
            request.DepartmentId,
            request.Role,
            request.ManagerId);

        await _employeeRepository.AddAsync(employee, cancellationToken);
        return employee.ToResponse();
    }

    public async Task<EmployeeResponse> GetEmployeeByIdAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await GetEmployeeAsync(employeeId, cancellationToken);
        return employee.ToResponse();
    }

    public async Task<PagedResult<EmployeeResponse>> GetEmployeesAsync(
        EmployeeQuery query,
        CancellationToken cancellationToken = default)
    {
        await _queryValidator.ValidateAndThrowAsync(query, cancellationToken);

        var employees = await _employeeRepository.GetPagedAsync(query, cancellationToken);
        return employees.MapItems(employee => employee.ToResponse());
    }

    public async Task<EmployeeResponse> UpdateEmployeeAsync(
        Guid employeeId,
        UpdateEmployeeRequest request,
        CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var employee = await GetEmployeeAsync(employeeId, cancellationToken);
        var email = NormalizeEmail(request.Email);

        if (await _employeeRepository.ExistsByEmailAsync(email, employeeId, cancellationToken))
        {
            throw new ConflictException("Employee email already exists.");
        }

        await EnsureActiveDepartmentAsync(request.DepartmentId, cancellationToken);
        await EnsureManagerExistsAsync(request.ManagerId, cancellationToken);

        employee.UpdateProfile(request.FirstName, request.LastName, email, request.PhoneNumber);
        employee.ChangeDepartment(request.DepartmentId);
        employee.ChangeRole(request.Role);
        employee.AssignManager(request.ManagerId);

        await _employeeRepository.UpdateAsync(employee, cancellationToken);
        return employee.ToResponse();
    }

    public async Task DeactivateEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await GetEmployeeAsync(employeeId, cancellationToken);
        employee.Deactivate();
        await _employeeRepository.UpdateAsync(employee, cancellationToken);
    }

    public async Task ActivateEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await GetEmployeeAsync(employeeId, cancellationToken);
        employee.Activate();
        await _employeeRepository.UpdateAsync(employee, cancellationToken);
    }

    private async Task<Employee> GetEmployeeAsync(Guid employeeId, CancellationToken cancellationToken)
    {
        var employee = await _employeeRepository.GetByIdAsync(employeeId, cancellationToken);
        if (employee is null)
        {
            throw new NotFoundException("Employee was not found.");
        }

        return employee;
    }

    private async Task EnsureActiveDepartmentAsync(Guid departmentId, CancellationToken cancellationToken)
    {
        var department = await _departmentRepository.GetByIdAsync(departmentId, cancellationToken);
        if (department is null || !department.IsActive)
        {
            throw new NotFoundException("Active department was not found.");
        }
    }

    private async Task EnsureManagerExistsAsync(Guid? managerId, CancellationToken cancellationToken)
    {
        if (!managerId.HasValue)
        {
            return;
        }

        var manager = await _employeeRepository.GetByIdAsync(managerId.Value, cancellationToken);
        if (manager is null || !manager.IsActive)
        {
            throw new NotFoundException("Active manager was not found.");
        }
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
