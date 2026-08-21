using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;
using EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/attendance")]
public sealed class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    private readonly ILogger<AttendanceController> _logger;

    public AttendanceController(
        IAttendanceService attendanceService,
        ILogger<AttendanceController> logger)
    {
        _attendanceService = attendanceService;
        _logger = logger;
    }

    [HttpPost("check-in")]
    [ProducesResponseType(typeof(AttendanceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AttendanceResponse>> CheckIn(
        CheckInRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _attendanceService.CheckInAsync(request, cancellationToken);
        _logger.LogInformation("Employee {EmployeeId} checked in", response.EmployeeId);

        return Ok(response);
    }

    [HttpPost("check-out")]
    [ProducesResponseType(typeof(AttendanceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AttendanceResponse>> CheckOut(CancellationToken cancellationToken)
    {
        var response = await _attendanceService.CheckOutAsync(cancellationToken);
        _logger.LogInformation("Employee {EmployeeId} checked out", response.EmployeeId);

        return Ok(response);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(PagedResult<AttendanceResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<AttendanceResponse>>> GetMyAttendance(
        [FromQuery] AttendanceQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await _attendanceService.GetMyAttendanceAsync(query, cancellationToken));
    }

    [Authorize(Policy = "ManagerOrAdmin")]
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AttendanceResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AttendanceResponse>>> GetAttendance(
        [FromQuery] AttendanceQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await _attendanceService.GetAttendanceAsync(query, cancellationToken));
    }
}
