using EMS.Domain.Common;
using EMS.Domain.Enums;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Entities;

public sealed class LeaveRequest : AuditableEntity
{
    public LeaveRequest(
        Guid employeeId,
        LeaveType leaveType,
        DateOnly startDate,
        DateOnly endDate,
        string reason)
    {
        EmployeeId = RequireId(employeeId, nameof(employeeId));
        LeaveType = leaveType;
        StartDate = startDate;
        EndDate = endDate;
        Reason = RequireText(reason, nameof(reason));
        Status = LeaveStatus.Pending;
        AppliedOn = DateTime.UtcNow;

        if (StartDate > EndDate)
        {
            throw new DomainException("Start date cannot be after end date.");
        }
    }

    public Guid EmployeeId { get; private set; }

    public LeaveType LeaveType { get; private set; }

    public DateOnly StartDate { get; private set; }

    public DateOnly EndDate { get; private set; }

    public string Reason { get; private set; }

    public LeaveStatus Status { get; private set; }

    public Guid? ApprovedById { get; private set; }

    public DateTime AppliedOn { get; private set; }

    public DateTime? ReviewedAt { get; private set; }

    public void Approve(Guid approverId)
    {
        EnsurePending("Only pending leave requests can be approved.");
        CompleteReview(LeaveStatus.Approved, approverId);
    }

    public void Reject(Guid approverId)
    {
        EnsurePending("Only pending leave requests can be rejected.");
        CompleteReview(LeaveStatus.Rejected, approverId);
    }

    private void CompleteReview(LeaveStatus status, Guid approverId)
    {
        ApprovedById = RequireId(approverId, nameof(approverId));
        Status = status;
        ReviewedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    private void EnsurePending(string message)
    {
        if (Status != LeaveStatus.Pending)
        {
            throw new DomainException(message);
        }
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
}
