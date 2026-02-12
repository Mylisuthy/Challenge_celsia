using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using FieldConnect.Api.Models;

namespace FieldConnect.Api.Services;

public interface IAuthService
{
    string GenerateToken(User user);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
}

public class AuthService : IAuthService
{
    private readonly string _secret;
    private readonly string _issuer;

    public AuthService(string secret, string issuer)
    {
        _secret = secret;
        _issuer = issuer;
    }

    public string GenerateToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_secret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", user.Id.ToString()),
                new Claim("nic", user.NIC ?? ""),
                new Claim("name", user.Name),
                new Claim("role", user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _issuer,
            Audience = _issuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}
