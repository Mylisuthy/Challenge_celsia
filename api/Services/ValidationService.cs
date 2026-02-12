namespace FieldConnect.Api.Services;

public interface IValidationService
{
    bool IsDateValid(string dateString);
}

public class ValidationService : IValidationService
{
    public bool IsDateValid(string dateString)
    {
        if (!DateTime.TryParse(dateString, out var requestedDate))
            return false;

        // Rule: Appointment must be at least 15 days in the future
        return requestedDate >= DateTime.Today.AddDays(15);
    }
}
