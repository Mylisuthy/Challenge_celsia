using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FieldConnect.Api.Models;
using FieldConnect.Api.Services;
using Xunit;

namespace FieldConnect.Tests;

public class AuthServiceTests
{
    private readonly AuthService _authService;
    private const string Secret = "super_secret_key_for_testing_1234567890";
    private const string Issuer = "FieldConnectTest";

    public AuthServiceTests()
    {
        _authService = new AuthService(Secret, Issuer);
    }

    [Fact]
    public void GenerateToken_ShouldIncludeRoleClaim()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            NIC = "12345678",
            Name = "John Doe",
            Role = UserRoles.Admin
        };

        // Act
        var token = _authService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "role");
        Assert.NotNull(roleClaim);
        Assert.Equal(UserRoles.Admin, roleClaim.Value);
    }

    [Fact]
    public void GenerateToken_ShouldIncludeUserIdAndNIC()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            NIC = "ADMIN01",
            Name = "Super Admin",
            Role = UserRoles.Admin
        };

        // Act
        var token = _authService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        Assert.Equal("42", jwtToken.Claims.First(c => c.Type == "id").Value);
        Assert.Equal("ADMIN01", jwtToken.Claims.First(c => c.Type == "nic").Value);
    }
}
