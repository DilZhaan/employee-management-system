using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Leave;
using EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/leave-requests")]
public sealed class LeaveRequestsController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    private readonly ILogger<LeaveRequestsController> _logger;

    public LeaveRequestsController(ILeaveService leaveService, ILogger<LeaveRequestsController> logger)
    {
        _leaveService = leaveService;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(typeof(LeaveRequestResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LeaveRequestResponse>> CreateLeaveRequest(
        CreateLeaveRequestDto request,
        CancellationToken cancellationToken)
    {
        var response = await _leaveService.CreateLeaveRequestAsync(request, cancellationToken);
        _logger.LogInformation("Leave request {LeaveRequestId} created for employee {EmployeeId}", response.Id, response.EmployeeId);

        return CreatedAtAction(nameof(GetMyLeaveRequests), null, response);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(PagedResult<LeaveRequestResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<LeaveRequestResponse>>> GetMyLeaveRequests(
        [FromQuery] LeaveRequestQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await _leaveService.GetMyLeaveRequestsAsync(query, cancellationToken));
    }

    [Authorize(Policy = "ManagerOrAdmin")]
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<LeaveRequestResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<LeaveRequestResponse>>> GetLeaveRequests(
        [FromQuery] LeaveRequestQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await _leaveService.GetLeaveRequestsAsync(query, cancellationToken));
    }

    [Authorize(Policy = "ManagerOrAdmin")]
    [HttpPatch("{id:guid}/approve")]
    [ProducesResponseType(typeof(LeaveRequestResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeaveRequestResponse>> ApproveLeaveRequest(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await _leaveService.ApproveLeaveAsync(id, cancellationToken);
        _logger.LogInformation("Leave request {LeaveRequestId} approved", response.Id);

        return Ok(response);
    }

    [Authorize(Policy = "ManagerOrAdmin")]
    [HttpPatch("{id:guid}/reject")]
    [ProducesResponseType(typeof(LeaveRequestResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeaveRequestResponse>> RejectLeaveRequest(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await _leaveService.RejectLeaveAsync(id, cancellationToken);
        _logger.LogInformation("Leave request {LeaveRequestId} rejected", response.Id);

        return Ok(response);
    }
}
