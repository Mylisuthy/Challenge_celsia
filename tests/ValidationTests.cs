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
    public void IsDateValid_ShouldReturnFalse_WhenDateIsLessThen15DaysAway()
    {
        // Arrange
        var date = DateTime.Today.AddDays(10).ToString("yyyy-MM-dd");

        // Act
        var result = _validationService.IsDateValid(date);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsDateValid_ShouldReturnTrue_WhenDateIsAtLeast15DaysAway()
    {
        // Arrange
        var date = DateTime.Today.AddDays(16).ToString("yyyy-MM-dd");

        // Act
        var result = _validationService.IsDateValid(date);

        // Assert
        Assert.True(result);
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
