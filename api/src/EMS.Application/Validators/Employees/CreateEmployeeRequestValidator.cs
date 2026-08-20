using EMS.Application.DTOs.Employees;
using FluentValidation;

namespace EMS.Application.Validators.Employees;

public sealed class CreateEmployeeRequestValidator : AbstractValidator<CreateEmployeeRequest>
{
    public CreateEmployeeRequestValidator()
    {
        RuleFor(request => request.EmployeeCode)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumCodeLength);

        RuleFor(request => request.FirstName)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumNameLength);

        RuleFor(request => request.LastName)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumNameLength);

        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(request => request.Password)
            .NotEmpty()
            .MinimumLength(8);

        RuleFor(request => request.DepartmentId)
            .NotEmpty();

        RuleFor(request => request.ManagerId)
            .NotEqual(Guid.Empty)
            .When(request => request.ManagerId.HasValue);
    }
}
