using EMS.Application.DTOs.Departments;
using FluentValidation;

namespace EMS.Application.Validators.Departments;

public sealed class DepartmentQueryValidator : AbstractValidator<DepartmentQuery>
{
    public DepartmentQueryValidator()
    {
        RuleFor(query => query.Page)
            .GreaterThan(0);

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, ValidationConstants.MaximumPageSize);

        RuleFor(query => query.Search)
            .MaximumLength(ValidationConstants.MaximumSearchLength);
    }
}
