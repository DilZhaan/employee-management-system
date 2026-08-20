using EMS.Domain.Common;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Entities;

public sealed class Department : AuditableEntity
{
    public Department(string name, string code)
    {
        Name = RequireText(name, nameof(name));
        Code = RequireText(code, nameof(code));
        IsActive = true;
    }

    public string Name { get; private set; }

    public string Code { get; private set; }

    public bool IsActive { get; private set; }

    public void UpdateDetails(string name, string code)
    {
        Name = RequireText(name, nameof(name));
        Code = RequireText(code, nameof(code));
        MarkUpdated();
    }

    public void Deactivate()
    {
        if (!IsActive)
        {
            throw new DomainException("Department is already inactive.");
        }

        IsActive = false;
        MarkUpdated();
    }

    public void Activate()
    {
        if (IsActive)
        {
            throw new DomainException("Department is already active.");
        }

        IsActive = true;
        MarkUpdated();
    }

    private static string RequireText(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException($"{parameterName} is required.");
        }

        return value.Trim();
    }
}
