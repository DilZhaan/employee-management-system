using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/departments")]
public sealed class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(
        IDepartmentService departmentService,
        ILogger<DepartmentsController> logger)
    {
        _departmentService = departmentService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DepartmentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<DepartmentResponse>>> GetDepartments(
        [FromQuery] DepartmentQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await _departmentService.GetDepartmentsAsync(query, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DepartmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepartmentResponse>> GetDepartment(
        Guid id,
        CancellationToken cancellationToken)
    {
        return Ok(await _departmentService.GetDepartmentByIdAsync(id, cancellationToken));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    [ProducesResponseType(typeof(DepartmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DepartmentResponse>> CreateDepartment(
        CreateDepartmentRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _departmentService.CreateDepartmentAsync(request, cancellationToken);
        _logger.LogInformation("Department {DepartmentId} created", response.Id);

        return CreatedAtAction(nameof(GetDepartment), new { id = response.Id }, response);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(DepartmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DepartmentResponse>> UpdateDepartment(
        Guid id,
        UpdateDepartmentRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _departmentService.UpdateDepartmentAsync(id, request, cancellationToken));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateDepartment(Guid id, CancellationToken cancellationToken)
    {
        await _departmentService.DeactivateDepartmentAsync(id, cancellationToken);
        _logger.LogInformation("Department {DepartmentId} deactivated", id);

        return NoContent();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:guid}/activate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActivateDepartment(Guid id, CancellationToken cancellationToken)
    {
        await _departmentService.ActivateDepartmentAsync(id, cancellationToken);
        _logger.LogInformation("Department {DepartmentId} activated", id);

        return NoContent();
    }
}
