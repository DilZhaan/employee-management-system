using EMS.Application.DTOs.Employees;
using EMS.Application.Exceptions;
using EMS.Application.Services;
using EMS.Application.Validators.Employees;
using EMS.Domain.Enums;

namespace EMS.Application.Tests;

public sealed class EmployeeServiceTests
{
    [Fact]
    public async Task CreateEmployeeAsync_WhenEmailExists_ThrowsConflictException()
    {
        var department = TestEntities.Department();
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(TestEntities.Employee(department.Id, email: "ada@example.com"));
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(employeeRepository, departmentRepository);

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateEmployeeAsync(CreateRequest(department.Id, email: "ADA@EXAMPLE.COM")));
    }

    [Fact]
    public async Task CreateEmployeeAsync_WhenEmployeeCodeExists_ThrowsConflictException()
    {
        var department = TestEntities.Department();
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(TestEntities.Employee(department.Id, employeeCode: "EMP-100"));
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(employeeRepository, departmentRepository);

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateEmployeeAsync(CreateRequest(department.Id, employeeCode: "EMP-100")));
    }

    [Fact]
    public async Task CreateEmployeeAsync_WhenDepartmentIsInactive_ThrowsNotFoundException()
    {
        var department = TestEntities.Department();
        department.Deactivate();
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(new InMemoryEmployeeRepository(), departmentRepository);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.CreateEmployeeAsync(CreateRequest(department.Id)));
    }

    [Fact]
    public async Task CreateEmployeeAsync_WhenDepartmentDoesNotExist_ThrowsNotFoundException()
    {
        var service = CreateService(new InMemoryEmployeeRepository(), new InMemoryDepartmentRepository());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.CreateEmployeeAsync(CreateRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task CreateEmployeeAsync_WithValidRequest_CreatesEmployeeWithHashedPassword()
    {
        var department = TestEntities.Department();
        var employeeRepository = new InMemoryEmployeeRepository();
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var passwordHasher = new RecordingPasswordHasher();
        var service = CreateService(employeeRepository, departmentRepository, passwordHasher);

        var response = await service.CreateEmployeeAsync(CreateRequest(department.Id));

        Assert.NotEqual(Guid.Empty, response.Id);
        Assert.Equal("new@example.com", response.Email);
        Assert.Equal("plain-password", passwordHasher.HashedPassword);
        Assert.Equal("hashed:plain-password", employeeRepository.AddedEmployee?.PasswordHash);
    }

    [Fact]
    public async Task DeactivateEmployeeAsync_WhenEmployeeExists_DeactivatesEmployee()
    {
        var department = TestEntities.Department();
        var employee = TestEntities.Employee(department.Id);
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(employee);
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(employeeRepository, departmentRepository);

        await service.DeactivateEmployeeAsync(employee.Id);

        Assert.False(employee.IsActive);
        Assert.Equal(employee, employeeRepository.UpdatedEmployee);
    }

    [Fact]
    public async Task ActivateEmployeeAsync_WhenEmployeeIsInactive_ActivatesEmployee()
    {
        var department = TestEntities.Department();
        var employee = TestEntities.Employee(department.Id);
        employee.Deactivate();
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(employee);
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(employeeRepository, departmentRepository);

        await service.ActivateEmployeeAsync(employee.Id);

        Assert.True(employee.IsActive);
        Assert.Equal(employee, employeeRepository.UpdatedEmployee);
    }

    private static EmployeeService CreateService(
        InMemoryEmployeeRepository employeeRepository,
        InMemoryDepartmentRepository departmentRepository,
        RecordingPasswordHasher? passwordHasher = null)
    {
        return new EmployeeService(
            employeeRepository,
            departmentRepository,
            passwordHasher ?? new RecordingPasswordHasher(),
            new CreateEmployeeRequestValidator(),
            new UpdateEmployeeRequestValidator(),
            new EmployeeQueryValidator());
    }

    private static CreateEmployeeRequest CreateRequest(
        Guid departmentId,
        string email = "new@example.com",
        string employeeCode = "EMP-200")
    {
        return new CreateEmployeeRequest(
            employeeCode,
            "Grace",
            "Hopper",
            email,
            "plain-password",
            null,
            departmentId,
            EmployeeRole.Employee,
            null);
    }
}
