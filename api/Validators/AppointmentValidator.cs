using FluentValidation;
using FieldConnect.Api.Models;

namespace FieldConnect.Api.Validators;

public class AppointmentValidator : AbstractValidator<AppointmentDTO>
{
    public AppointmentValidator(FieldConnect.Api.Services.IValidationService validationService)
    {
        RuleFor(x => x.NIC).NotEmpty().MinimumLength(5);
        RuleFor(x => x.Date).NotEmpty().Matches(@"^\d{4}-\d{2}-\d{2}$")
            .Must(validationService.IsDateValid).WithMessage("La cita debe programarse con al menos 15 días de anticipación.");
        RuleFor(x => x.Slot).NotEmpty().Must(s => s == "AM" || s == "PM");
    }
}
