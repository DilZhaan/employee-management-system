using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Employees;
using EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.Api.Controllers;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("api/v1/employees")]
public sealed class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(IEmployeeService employeeService, ILogger<EmployeesController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<EmployeeResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<EmployeeResponse>>> GetEmployees(
        [FromQuery] EmployeeQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await _employeeService.GetEmployeesAsync(query, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EmployeeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeResponse>> GetEmployee(
        Guid id,
        CancellationToken cancellationToken)
    {
        return Ok(await _employeeService.GetEmployeeByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType(typeof(EmployeeResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmployeeResponse>> CreateEmployee(
        CreateEmployeeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _employeeService.CreateEmployeeAsync(request, cancellationToken);
        _logger.LogInformation("Employee {EmployeeId} created", response.Id);

        return CreatedAtAction(nameof(GetEmployee), new { id = response.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EmployeeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmployeeResponse>> UpdateEmployee(
        Guid id,
        UpdateEmployeeRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _employeeService.UpdateEmployeeAsync(id, request, cancellationToken));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateEmployee(Guid id, CancellationToken cancellationToken)
    {
        await _employeeService.DeactivateEmployeeAsync(id, cancellationToken);
        _logger.LogInformation("Employee {EmployeeId} deactivated", id);

        return NoContent();
    }
}
