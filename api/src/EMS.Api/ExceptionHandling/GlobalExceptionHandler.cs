using EMS.Application.Exceptions;
using EMS.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EMS.Api.ExceptionHandling;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problemDetails = exception switch
        {
            AuthenticationException => CreateProblemDetails(httpContext, StatusCodes.Status401Unauthorized, "Unauthorized", exception.Message),
            ForbiddenException => CreateProblemDetails(httpContext, StatusCodes.Status403Forbidden, "Forbidden", exception.Message),
            NotFoundException => CreateProblemDetails(httpContext, StatusCodes.Status404NotFound, "Not Found", exception.Message),
            ConflictException => CreateProblemDetails(httpContext, StatusCodes.Status409Conflict, "Conflict", exception.Message),
            DomainException => CreateProblemDetails(httpContext, StatusCodes.Status400BadRequest, "Bad Request", exception.Message),
            ValidationException validationException => CreateValidationProblemDetails(httpContext, validationException),
            _ => CreateProblemDetails(httpContext, StatusCodes.Status500InternalServerError, "Server Error", "An unexpected error occurred.")
        };

        if (problemDetails.Status == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception for {Path}", httpContext.Request.Path);
        }
        else
        {
            _logger.LogWarning(
                exception,
                "Handled exception {ExceptionType} for {Path}",
                exception.GetType().Name,
                httpContext.Request.Path);
        }

        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
        httpContext.Response.ContentType = "application/problem+json";

        await WriteProblemDetailsAsync(httpContext, problemDetails, cancellationToken);
        return true;
    }

    private static Task WriteProblemDetailsAsync(
        HttpContext httpContext,
        ProblemDetails problemDetails,
        CancellationToken cancellationToken)
    {
        if (problemDetails is ValidationProblemDetails validationProblemDetails)
        {
            return httpContext.Response.WriteAsJsonAsync(validationProblemDetails, cancellationToken);
        }

        return httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
    }

    private static ProblemDetails CreateProblemDetails(
        HttpContext httpContext,
        int status,
        string title,
        string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{status}",
            Title = title,
            Status = status,
            Detail = detail,
            Instance = httpContext.Request.Path
        };
        problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;

        return problemDetails;
    }

    private static ValidationProblemDetails CreateValidationProblemDetails(
        HttpContext httpContext,
        ValidationException exception)
    {
        var errors = exception.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.ErrorMessage).ToArray());

        var problemDetails = new ValidationProblemDetails(errors)
        {
            Type = "https://httpstatuses.com/400",
            Title = "Validation Failed",
            Status = StatusCodes.Status400BadRequest,
            Detail = "One or more validation errors occurred.",
            Instance = httpContext.Request.Path
        };
        problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;

        return problemDetails;
    }
}
