using EMS.Application.DTOs.Employees;
using FluentValidation;

namespace EMS.Application.Validators.Employees;

public sealed class EmployeeQueryValidator : AbstractValidator<EmployeeQuery>
{
    public EmployeeQueryValidator()
    {
        RuleFor(query => query.Page)
            .GreaterThan(0);

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, ValidationConstants.MaximumPageSize);

        RuleFor(query => query.Search)
            .MaximumLength(ValidationConstants.MaximumSearchLength);
    }
}
