using EMS.Domain.Entities;
using EMS.Domain.Enums;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Tests;

public sealed class LeaveRequestTests
{
    [Fact]
    public void Create_WithValidValues_StartsPending()
    {
        var leaveRequest = CreateLeaveRequest();

        Assert.NotEqual(Guid.Empty, leaveRequest.Id);
        Assert.Equal(LeaveStatus.Pending, leaveRequest.Status);
        Assert.Null(leaveRequest.ApprovedById);
        Assert.Null(leaveRequest.ReviewedAt);
        Assert.Equal(DateTimeKind.Utc, leaveRequest.AppliedOn.Kind);
        Assert.Null(leaveRequest.UpdatedAt);
    }

    [Fact]
    public void Approve_WhenPending_Succeeds()
    {
        var leaveRequest = CreateLeaveRequest();
        var approverId = Guid.NewGuid();

        leaveRequest.Approve(approverId);

        Assert.Equal(LeaveStatus.Approved, leaveRequest.Status);
        Assert.Equal(approverId, leaveRequest.ApprovedById);
        Assert.NotNull(leaveRequest.ReviewedAt);
        Assert.NotNull(leaveRequest.UpdatedAt);
    }

    [Fact]
    public void Reject_WhenPending_Succeeds()
    {
        var leaveRequest = CreateLeaveRequest();
        var approverId = Guid.NewGuid();

        leaveRequest.Reject(approverId);

        Assert.Equal(LeaveStatus.Rejected, leaveRequest.Status);
        Assert.Equal(approverId, leaveRequest.ApprovedById);
        Assert.NotNull(leaveRequest.ReviewedAt);
    }

    [Fact]
    public void Approve_WhenAlreadyApproved_ThrowsDomainException()
    {
        var leaveRequest = CreateLeaveRequest();
        leaveRequest.Approve(Guid.NewGuid());

        Assert.Throws<DomainException>(() => leaveRequest.Approve(Guid.NewGuid()));
    }

    [Fact]
    public void Reject_WhenAlreadyApproved_ThrowsDomainException()
    {
        var leaveRequest = CreateLeaveRequest();
        leaveRequest.Approve(Guid.NewGuid());

        Assert.Throws<DomainException>(() => leaveRequest.Reject(Guid.NewGuid()));
    }

    [Fact]
    public void Approve_WhenRejected_ThrowsDomainException()
    {
        var leaveRequest = CreateLeaveRequest();
        leaveRequest.Reject(Guid.NewGuid());

        Assert.Throws<DomainException>(() => leaveRequest.Approve(Guid.NewGuid()));
    }

    [Fact]
    public void Reject_WhenAlreadyRejected_ThrowsDomainException()
    {
        var leaveRequest = CreateLeaveRequest();
        leaveRequest.Reject(Guid.NewGuid());

        Assert.Throws<DomainException>(() => leaveRequest.Reject(Guid.NewGuid()));
    }

    [Fact]
    public void Create_WithInvalidDateRange_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() => new LeaveRequest(
            Guid.NewGuid(),
            LeaveType.Annual,
            new DateOnly(2026, 8, 21),
            new DateOnly(2026, 8, 20),
            "Family event"));
    }

    [Fact]
    public void Create_WithEmptyReason_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() => new LeaveRequest(
            Guid.NewGuid(),
            LeaveType.Sick,
            new DateOnly(2026, 8, 20),
            new DateOnly(2026, 8, 20),
            " "));
    }

    private static LeaveRequest CreateLeaveRequest()
    {
        return new LeaveRequest(
            Guid.NewGuid(),
            LeaveType.Annual,
            new DateOnly(2026, 8, 20),
            new DateOnly(2026, 8, 21),
            "Family event");
    }
}
