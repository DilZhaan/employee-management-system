using EMS.Application.DTOs.Attendance;
using FluentValidation;

namespace EMS.Application.Validators.Attendance;

public sealed class AttendanceQueryValidator : AbstractValidator<AttendanceQuery>
{
    public AttendanceQueryValidator()
    {
        RuleFor(query => query.Page)
            .GreaterThan(0);

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, ValidationConstants.MaximumPageSize);

        RuleFor(query => query.EmployeeSearch)
            .MaximumLength(100);

        RuleFor(query => query)
            .Must(query => !query.From.HasValue || !query.To.HasValue || query.From <= query.To)
            .WithMessage("From date cannot be after to date.");
    }
}
