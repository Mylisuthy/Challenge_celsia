using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.IdentityModel.Tokens;

namespace FieldConnect.Api.Middleware;

public class JwtMiddleware : IFunctionsWorkerMiddleware
{
    private readonly string _secret;
    private readonly string _issuer;

    public JwtMiddleware()
    {
        _secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "";
        _issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "";
    }

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var request = await context.GetHttpRequestDataAsync();
        if (request == null)
        {
            await next(context);
            return;
        }

        // Only validate for protected routes (e.g., schedule)
        if (!request.Url.AbsolutePath.Contains("/api/schedule"))
        {
            await next(context);
            return;
        }

        var token = request.Headers.TryGetValues("Authorization", out var values) 
                    ? values.FirstOrDefault()?.Split(" ").Last() 
                    : null;

        if (token == null)
        {
            context.GetInvocationResult().Value = CreateUnauthorizedResponse(request);
            return;
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secret);
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _issuer,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            context.Items.Add("User", jwtToken.Claims);
            
            await next(context);
        }
        catch
        {
            context.GetInvocationResult().Value = CreateUnauthorizedResponse(request);
        }
    }

    private HttpResponseData CreateUnauthorizedResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.Unauthorized);
        response.WriteString("Unauthorized access.");
        return response;
    }
}
