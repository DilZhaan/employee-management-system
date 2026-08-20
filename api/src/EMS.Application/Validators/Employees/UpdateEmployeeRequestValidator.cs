using EMS.Application.DTOs.Employees;
using FluentValidation;

namespace EMS.Application.Validators.Employees;

public sealed class UpdateEmployeeRequestValidator : AbstractValidator<UpdateEmployeeRequest>
{
    public UpdateEmployeeRequestValidator()
    {
        RuleFor(request => request.FirstName)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumNameLength);

        RuleFor(request => request.LastName)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumNameLength);

        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(request => request.DepartmentId)
            .NotEmpty();

        RuleFor(request => request.ManagerId)
            .NotEqual(Guid.Empty)
            .When(request => request.ManagerId.HasValue);
    }
}
