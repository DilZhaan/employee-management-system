using EMS.Application.DTOs.Attendance;
using FluentValidation;

namespace EMS.Application.Validators.Attendance;

public sealed class CheckInRequestValidator : AbstractValidator<CheckInRequest>
{
    public CheckInRequestValidator()
    {
        RuleFor(request => request.DeviceType)
            .IsInEnum();
    }
}
