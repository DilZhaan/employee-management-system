using EMS.Application.DTOs.Leave;
using FluentValidation;

namespace EMS.Application.Validators.Leave;

public sealed class CreateLeaveRequestDtoValidator : AbstractValidator<CreateLeaveRequestDto>
{
    public CreateLeaveRequestDtoValidator()
    {
        RuleFor(request => request.LeaveType)
            .IsInEnum();

        RuleFor(request => request.Reason)
            .NotEmpty()
            .MaximumLength(ValidationConstants.MaximumReasonLength);

        RuleFor(request => request)
            .Must(request => request.StartDate <= request.EndDate)
            .WithMessage("Start date cannot be after end date.");
    }
}
