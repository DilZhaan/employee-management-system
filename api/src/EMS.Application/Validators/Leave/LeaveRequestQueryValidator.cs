using EMS.Application.DTOs.Leave;
using FluentValidation;

namespace EMS.Application.Validators.Leave;

public sealed class LeaveRequestQueryValidator : AbstractValidator<LeaveRequestQuery>
{
    public LeaveRequestQueryValidator()
    {
        RuleFor(query => query.Page)
            .GreaterThan(0);

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, ValidationConstants.MaximumPageSize);

        RuleFor(query => query.Status)
            .IsInEnum()
            .When(query => query.Status.HasValue);

        RuleFor(query => query.EmployeeSearch)
            .MaximumLength(100);

        RuleFor(query => query)
            .Must(query => !query.From.HasValue || !query.To.HasValue || query.From <= query.To)
            .WithMessage("From date cannot be after to date.");
    }
}
