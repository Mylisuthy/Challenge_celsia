using System.Linq;

namespace FieldConnect.Api.Services;

public interface IValidationService
{
    bool IsDateValid(string dateString);
    bool IsInSameWeekAsPending(string requestedDateStr, IEnumerable<string> pendingDateStrings);
}

public class ValidationService : IValidationService
{
    public bool IsDateValid(string dateString)
    {
        if (!DateTime.TryParse(dateString, out var requestedDate))
            return false;

        // Rule: Appointment must be at least 5 days in the future
        return requestedDate >= DateTime.Today.AddDays(5);
    }
    public bool IsInSameWeekAsPending(string requestedDateStr, IEnumerable<string> pendingDateStrings)
    {
        if (!pendingDateStrings.Any()) return true;

        if (!DateTime.TryParse(requestedDateStr, out var requestedDate))
            return false;

        var calendar = System.Globalization.CultureInfo.InvariantCulture.Calendar;
        var targetWeek = calendar.GetWeekOfYear(requestedDate, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
        var targetYear = requestedDate.Year;

        foreach (var dateStr in pendingDateStrings)
        {
            if (DateTime.TryParse(dateStr, out var pDate))
            {
                var pWeek = calendar.GetWeekOfYear(pDate, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
                var pYear = pDate.Year;

                if (targetWeek == pWeek && targetYear == pYear)
                {
                    return true;
                }
            }
        }

        return false;
    }
}
