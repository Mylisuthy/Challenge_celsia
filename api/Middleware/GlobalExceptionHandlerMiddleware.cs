using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Logging;

namespace FieldConnect.Api.Middleware;

public class GlobalExceptionHandlerMiddleware : IFunctionsWorkerMiddleware
{
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _logger = logger;
    }

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fatal capturado en Middleware: {Message}", ex.Message);

            var response = await context.GetHttpRequestDataAsync();
            if (response != null)
            {
                var errorResponse = response.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new { 
                    Error = "Internal Server Error", 
                    Detail = ex.Message,
                    StackTrace = ex.StackTrace 
                });
                context.GetInvocationResult().Value = errorResponse;
            }
        }
    }
}
