using EMS.Application.Abstractions.Authentication;
using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Leave;
using EMS.Application.Exceptions;
using EMS.Application.Mapping;
using EMS.Domain.Entities;
using EMS.Domain.Enums;
using FluentValidation;

namespace EMS.Application.Services;

public sealed class LeaveService : ILeaveService
{
    private readonly ILeaveRequestRepository _leaveRequestRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ICurrentUser _currentUser;
    private readonly IValidator<CreateLeaveRequestDto> _createValidator;
    private readonly IValidator<LeaveRequestQuery> _queryValidator;

    public LeaveService(
        ILeaveRequestRepository leaveRequestRepository,
        IEmployeeRepository employeeRepository,
        ICurrentUser currentUser,
        IValidator<CreateLeaveRequestDto> createValidator,
        IValidator<LeaveRequestQuery> queryValidator)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _employeeRepository = employeeRepository;
        _currentUser = currentUser;
        _createValidator = createValidator;
        _queryValidator = queryValidator;
    }

    public async Task<LeaveRequestResponse> CreateLeaveRequestAsync(
        CreateLeaveRequestDto request,
        CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var employeeId = RequireAuthenticatedEmployeeId();
        var employee = await GetActiveEmployeeAsync(employeeId, cancellationToken);

        var leaveRequest = new LeaveRequest(
            employee.Id,
            request.LeaveType,
            request.StartDate,
            request.EndDate,
            request.Reason);

        await _leaveRequestRepository.AddAsync(leaveRequest, cancellationToken);
        return leaveRequest.ToResponse();
    }

    public async Task<PagedResult<LeaveRequestResponse>> GetMyLeaveRequestsAsync(
        LeaveRequestQuery query,
        CancellationToken cancellationToken = default)
    {
        var employeeId = RequireAuthenticatedEmployeeId();
        var ownQuery = query with { EmployeeId = employeeId };

        await _queryValidator.ValidateAndThrowAsync(ownQuery, cancellationToken);

        var leaveRequests = await _leaveRequestRepository.GetPagedAsync(ownQuery, cancellationToken);
        return leaveRequests.MapItems(leaveRequest => leaveRequest.ToResponse());
    }

    public async Task<PagedResult<LeaveRequestResponse>> GetLeaveRequestsAsync(
        LeaveRequestQuery query,
        CancellationToken cancellationToken = default)
    {
        await _queryValidator.ValidateAndThrowAsync(query, cancellationToken);

        var leaveRequests = await _leaveRequestRepository.GetPagedAsync(query, cancellationToken);
        return leaveRequests.MapItems(leaveRequest => leaveRequest.ToResponse());
    }

    public async Task<LeaveRequestResponse> ApproveLeaveAsync(
        Guid leaveRequestId,
        CancellationToken cancellationToken = default)
    {
        var leaveRequest = await GetLeaveRequestAsync(leaveRequestId, cancellationToken);
        await EnsureCanReviewAsync(leaveRequest, cancellationToken);

        leaveRequest.Approve(_currentUser.EmployeeId!.Value);
        await _leaveRequestRepository.UpdateAsync(leaveRequest, cancellationToken);
        return leaveRequest.ToResponse();
    }

    public async Task<LeaveRequestResponse> RejectLeaveAsync(
        Guid leaveRequestId,
        CancellationToken cancellationToken = default)
    {
        var leaveRequest = await GetLeaveRequestAsync(leaveRequestId, cancellationToken);
        await EnsureCanReviewAsync(leaveRequest, cancellationToken);

        leaveRequest.Reject(_currentUser.EmployeeId!.Value);
        await _leaveRequestRepository.UpdateAsync(leaveRequest, cancellationToken);
        return leaveRequest.ToResponse();
    }

    private Guid RequireAuthenticatedEmployeeId()
    {
        if (!_currentUser.IsAuthenticated || !_currentUser.EmployeeId.HasValue)
        {
            throw new AuthenticationException("Authenticated employee is required.");
        }

        return _currentUser.EmployeeId.Value;
    }

    private async Task<Employee> GetActiveEmployeeAsync(Guid employeeId, CancellationToken cancellationToken)
    {
        var employee = await _employeeRepository.GetByIdAsync(employeeId, cancellationToken);
        if (employee is null)
        {
            throw new NotFoundException("Employee was not found.");
        }

        if (!employee.IsActive)
        {
            throw new ForbiddenException("Inactive employees cannot perform this action.");
        }

        return employee;
    }

    private async Task<LeaveRequest> GetLeaveRequestAsync(Guid leaveRequestId, CancellationToken cancellationToken)
    {
        var leaveRequest = await _leaveRequestRepository.GetByIdAsync(leaveRequestId, cancellationToken);
        if (leaveRequest is null)
        {
            throw new NotFoundException("Leave request was not found.");
        }

        return leaveRequest;
    }

    private async Task EnsureCanReviewAsync(LeaveRequest leaveRequest, CancellationToken cancellationToken)
    {
        var currentEmployeeId = RequireAuthenticatedEmployeeId();
        var role = _currentUser.Role;

        if (role == EmployeeRole.Admin)
        {
            return;
        }

        if (role != EmployeeRole.Manager)
        {
            throw new ForbiddenException("Only managers and admins can review leave requests.");
        }

        var requester = await _employeeRepository.GetByIdAsync(leaveRequest.EmployeeId, cancellationToken);
        if (requester is null)
        {
            throw new NotFoundException("Leave request employee was not found.");
        }

        if (requester.ManagerId != currentEmployeeId)
        {
            throw new ForbiddenException("Managers can only review direct subordinate leave requests.");
        }
    }
}
