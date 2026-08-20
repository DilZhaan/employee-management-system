using EMS.Domain.Entities;
using EMS.Domain.Enums;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Tests;

public sealed class EmployeeTests
{
    [Fact]
    public void Create_WithValidValues_Succeeds()
    {
        var departmentId = Guid.NewGuid();

        var employee = CreateEmployee(departmentId: departmentId);

        Assert.NotEqual(Guid.Empty, employee.Id);
        Assert.Equal("EMP-001", employee.EmployeeCode);
        Assert.Equal("Ada", employee.FirstName);
        Assert.Equal("Lovelace", employee.LastName);
        Assert.Equal("ada@example.com", employee.Email);
        Assert.Equal("hash-value", employee.PasswordHash);
        Assert.Equal("+94111222333", employee.PhoneNumber);
        Assert.Equal(departmentId, employee.DepartmentId);
        Assert.Equal(EmployeeRole.Employee, employee.Role);
        Assert.True(employee.IsActive);
        Assert.Null(employee.ManagerId);
        Assert.Null(employee.UpdatedAt);
    }

    [Fact]
    public void AssignManager_WhenManagerIsSameEmployee_ThrowsDomainException()
    {
        var employee = CreateEmployee();

        Assert.Throws<DomainException>(() => employee.AssignManager(employee.Id));
    }

    [Fact]
    public void AssignManager_WithValidManager_Succeeds()
    {
        var employee = CreateEmployee();
        var managerId = Guid.NewGuid();

        employee.AssignManager(managerId);

        Assert.Equal(managerId, employee.ManagerId);
        Assert.NotNull(employee.UpdatedAt);
    }

    [Fact]
    public void Deactivate_WhenActive_Succeeds()
    {
        var employee = CreateEmployee();

        employee.Deactivate();

        Assert.False(employee.IsActive);
        Assert.NotNull(employee.UpdatedAt);
    }

    [Theory]
    [InlineData("", "Ada", "Lovelace", "ada@example.com", "hash-value")]
    [InlineData("EMP-001", "", "Lovelace", "ada@example.com", "hash-value")]
    [InlineData("EMP-001", "Ada", "", "ada@example.com", "hash-value")]
    [InlineData("EMP-001", "Ada", "Lovelace", "", "hash-value")]
    [InlineData("EMP-001", "Ada", "Lovelace", "ada@example.com", "")]
    public void Create_WithMissingRequiredText_ThrowsDomainException(
        string employeeCode,
        string firstName,
        string lastName,
        string email,
        string passwordHash)
    {
        Assert.Throws<DomainException>(() => CreateEmployee(
            employeeCode,
            firstName,
            lastName,
            email,
            passwordHash));
    }

    [Fact]
    public void Create_WithMissingDepartment_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() => CreateEmployee(departmentId: Guid.Empty));
    }

    private static Employee CreateEmployee(
        string employeeCode = "EMP-001",
        string firstName = "Ada",
        string lastName = "Lovelace",
        string email = " ADA@EXAMPLE.COM ",
        string passwordHash = "hash-value",
        string? phoneNumber = " +94111222333 ",
        Guid? departmentId = null)
    {
        return new Employee(
            employeeCode,
            firstName,
            lastName,
            email,
            passwordHash,
            phoneNumber,
            departmentId ?? Guid.NewGuid(),
            EmployeeRole.Employee);
    }
}
