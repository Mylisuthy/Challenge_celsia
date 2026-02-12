using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;

namespace FieldConnect.Api.Middleware;

public class SecurityHeadersMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        await next(context);

        var request = await context.GetHttpRequestDataAsync();
        if (request != null)
        {
            var response = context.GetInvocationResult().Value as HttpResponseData;
            if (response != null)
            {
                response.Headers.Add("X-Content-Type-Options", "nosniff");
                response.Headers.Add("X-Frame-Options", "DENY");
                response.Headers.Add("X-XSS-Protection", "1; mode=block");
                response.Headers.Add("Referrer-Policy", "no-referrer");
                response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            }
        }
    }
}
