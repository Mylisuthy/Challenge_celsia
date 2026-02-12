using FieldConnect.Api.Services;
using Xunit;

namespace FieldConnect.Tests;

public class ValidationTests
{
    private readonly ValidationService _validationService;

    public ValidationTests()
    {
        _validationService = new ValidationService();
    }

    [Fact]
    public void IsDateValid_ShouldReturnFalse_WhenDateIsLessThen5DaysAway()
    {
        // Arrange
        var date = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd");

        // Act
        var result = _validationService.IsDateValid(date);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsDateValid_ShouldReturnTrue_WhenDateIsAtLeast5DaysAway()
    {
        // Arrange
        var date = DateTime.Today.AddDays(6).ToString("yyyy-MM-dd");

        // Act
        var result = _validationService.IsDateValid(date);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsInSameWeekAsPending_ShouldReturnTrue_WhenNoPendingAppointments()
    {
        // Arrange
        var requested = "2026-03-01";
        var pending = Enumerable.Empty<string>();

        // Act
        var result = _validationService.IsInSameWeekAsPending(requested, pending);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsInSameWeekAsPending_ShouldReturnTrue_WhenDatesAreInSameWeek()
    {
        // Arrange - Both are in the same week (starting Monday)
        var requested = "2026-03-04"; // Wednesday
        var pending = new[] { "2026-03-02" }; // Monday

        // Act
        var result = _validationService.IsInSameWeekAsPending(requested, pending);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsInSameWeekAsPending_ShouldReturnFalse_WhenRequestedIsInDifferentWeek()
    {
        // Arrange
        var requested = "2026-03-10"; // Next week
        var pending = new[] { "2026-03-02" };

        // Act
        var result = _validationService.IsInSameWeekAsPending(requested, pending);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsDateValid_ShouldReturnFalse_WhenDateIsInvalid()
    {
        // Arrange
        var date = "invalid-date";

        // Act
        var result = _validationService.IsDateValid(date);

        // Assert
        Assert.False(result);
    }
}
