using EMS.Application.DTOs.Departments;
using FluentValidation;

namespace EMS.Application.Validators.Departments;

public sealed class UpdateDepartmentRequestValidator : AbstractValidator<UpdateDepartmentRequest>
{
    public UpdateDepartmentRequestValidator()
    {
        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumNameLength);

        RuleFor(request => request.Code)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumCodeLength);
    }
}
