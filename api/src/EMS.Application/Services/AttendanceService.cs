using EMS.Application.Abstractions.Attendance;
using EMS.Application.Abstractions.Authentication;
using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;
using EMS.Application.Exceptions;
using EMS.Application.Mapping;
using EMS.Domain.Entities;
using FluentValidation;

namespace EMS.Application.Services;

public sealed class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IAttendancePolicy _attendancePolicy;
    private readonly ICurrentUser _currentUser;
    private readonly IValidator<CheckInRequest> _checkInValidator;
    private readonly IValidator<AttendanceQuery> _queryValidator;

    public AttendanceService(
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository,
        IAttendancePolicy attendancePolicy,
        ICurrentUser currentUser,
        IValidator<CheckInRequest> checkInValidator,
        IValidator<AttendanceQuery> queryValidator)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository = employeeRepository;
        _attendancePolicy = attendancePolicy;
        _currentUser = currentUser;
        _checkInValidator = checkInValidator;
        _queryValidator = queryValidator;
    }

    public async Task<AttendanceResponse> CheckInAsync(
        CheckInRequest request,
        CancellationToken cancellationToken = default)
    {
        await _checkInValidator.ValidateAndThrowAsync(request, cancellationToken);

        var employeeId = RequireAuthenticatedEmployeeId();
        var employee = await GetActiveEmployeeAsync(employeeId, cancellationToken);

        var activeAttendance = await _attendanceRepository.GetActiveByEmployeeIdAsync(employee.Id, cancellationToken);
        if (activeAttendance is not null)
        {
            throw new ConflictException("Employee already has an active attendance record.");
        }

        var checkInTime = DateTime.UtcNow;
        var status = _attendancePolicy.DetermineStatus(checkInTime);
        var attendanceLog = new AttendanceLog(employee.Id, checkInTime, status, request.DeviceType);

        await _attendanceRepository.AddAsync(attendanceLog, cancellationToken);
        return attendanceLog.ToResponse();
    }

    public async Task<AttendanceResponse> CheckOutAsync(CancellationToken cancellationToken = default)
    {
        var employeeId = RequireAuthenticatedEmployeeId();
        await GetActiveEmployeeAsync(employeeId, cancellationToken);

        var attendanceLog = await _attendanceRepository.GetActiveByEmployeeIdAsync(employeeId, cancellationToken);
        if (attendanceLog is null)
        {
            throw new NotFoundException("Active attendance record was not found.");
        }

        attendanceLog.CheckOut(DateTime.UtcNow);
        await _attendanceRepository.UpdateAsync(attendanceLog, cancellationToken);
        return attendanceLog.ToResponse();
    }

    public async Task<PagedResult<AttendanceResponse>> GetMyAttendanceAsync(
        AttendanceQuery query,
        CancellationToken cancellationToken = default)
    {
        var employeeId = RequireAuthenticatedEmployeeId();
        var ownQuery = query with { EmployeeId = employeeId };

        await _queryValidator.ValidateAndThrowAsync(ownQuery, cancellationToken);

        var attendance = await _attendanceRepository.GetPagedAsync(ownQuery, cancellationToken);
        return attendance.MapItems(attendanceLog => attendanceLog.ToResponse());
    }

    public async Task<PagedResult<AttendanceResponse>> GetAttendanceAsync(
        AttendanceQuery query,
        CancellationToken cancellationToken = default)
    {
        await _queryValidator.ValidateAndThrowAsync(query, cancellationToken);

        var attendance = await _attendanceRepository.GetPagedAsync(query, cancellationToken);
        return attendance.MapItems(attendanceLog => attendanceLog.ToResponse());
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
}
