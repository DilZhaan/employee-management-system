namespace EMS.Domain.Common;

public abstract class AuditableEntity : BaseEntity
{
    protected AuditableEntity()
    {
        CreatedAt = DateTime.UtcNow;
    }

    public DateTime CreatedAt { get; protected set; }

    public DateTime? UpdatedAt { get; protected set; }

    protected void MarkUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
