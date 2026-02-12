using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using FieldConnect.Api.Models;

namespace FieldConnect.Api.Services;

public interface IAuthService
{
    string GenerateToken(Customer customer);
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

    public string GenerateToken(Customer customer)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_secret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", customer.Id.ToString()),
                new Claim("nic", customer.NIC),
                new Claim("name", customer.Name)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _issuer,
            Audience = _issuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
