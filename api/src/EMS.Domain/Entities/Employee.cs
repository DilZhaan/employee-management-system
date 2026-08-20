using EMS.Domain.Common;
using EMS.Domain.Enums;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Entities;

public sealed class Employee : AuditableEntity
{
    public Employee(
        string employeeCode,
        string firstName,
        string lastName,
        string email,
        string passwordHash,
        string? phoneNumber,
        Guid departmentId,
        EmployeeRole role,
        Guid? managerId = null)
    {
        EmployeeCode = RequireText(employeeCode, nameof(employeeCode));
        FirstName = RequireText(firstName, nameof(firstName));
        LastName = RequireText(lastName, nameof(lastName));
        Email = NormalizeEmail(email);
        PasswordHash = RequireText(passwordHash, nameof(passwordHash));
        PhoneNumber = NormalizeOptionalText(phoneNumber);
        DepartmentId = RequireId(departmentId, nameof(departmentId));
        Role = role;
        IsActive = true;

        AssignManager(managerId);
        UpdatedAt = null;
    }

    public string EmployeeCode { get; private set; }

    public string FirstName { get; private set; }

    public string LastName { get; private set; }

    public string Email { get; private set; }

    public string PasswordHash { get; private set; }

    public string? PhoneNumber { get; private set; }

    public Guid DepartmentId { get; private set; }

    public EmployeeRole Role { get; private set; }

    public Guid? ManagerId { get; private set; }

    public bool IsActive { get; private set; }

    public void UpdateProfile(string firstName, string lastName, string email, string? phoneNumber)
    {
        FirstName = RequireText(firstName, nameof(firstName));
        LastName = RequireText(lastName, nameof(lastName));
        Email = NormalizeEmail(email);
        PhoneNumber = NormalizeOptionalText(phoneNumber);
        MarkUpdated();
    }

    public void AssignManager(Guid? managerId)
    {
        if (managerId == Guid.Empty)
        {
            throw new DomainException("managerId is required.");
        }

        if (managerId == Id)
        {
            throw new DomainException("Employee cannot be assigned as their own manager.");
        }

        ManagerId = managerId;
        MarkUpdated();
    }

    public void ChangeDepartment(Guid departmentId)
    {
        DepartmentId = RequireId(departmentId, nameof(departmentId));
        MarkUpdated();
    }

    public void ChangeRole(EmployeeRole role)
    {
        Role = role;
        MarkUpdated();
    }

    public void ChangePasswordHash(string passwordHash)
    {
        PasswordHash = RequireText(passwordHash, nameof(passwordHash));
        MarkUpdated();
    }

    public void Deactivate()
    {
        if (!IsActive)
        {
            throw new DomainException("Employee is already inactive.");
        }

        IsActive = false;
        MarkUpdated();
    }

    public void Activate()
    {
        if (IsActive)
        {
            throw new DomainException("Employee is already active.");
        }

        IsActive = true;
        MarkUpdated();
    }

    private static Guid RequireId(Guid value, string parameterName)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException($"{parameterName} is required.");
        }

        return value;
    }

    private static string RequireText(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException($"{parameterName} is required.");
        }

        return value.Trim();
    }

    private static string NormalizeEmail(string email)
    {
        return RequireText(email, nameof(email)).ToLowerInvariant();
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
