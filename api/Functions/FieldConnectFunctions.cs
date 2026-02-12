using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FieldConnect.Api.Models;
using FieldConnect.Api.Repositories;
using FluentValidation;

namespace FieldConnect.Api.Functions;

public class FieldConnectFunctions
{
    private readonly ILogger<FieldConnectFunctions> _logger;
    private readonly IAppointmentRepository _repository;
    private readonly IValidator<AppointmentDTO> _validator;

    public FieldConnectFunctions(
        ILogger<FieldConnectFunctions> logger,
        IAppointmentRepository repository,
        IValidator<AppointmentDTO> validator)
    {
        _logger = logger;
        _repository = repository;
        _validator = validator;
    }

    [Function("ValidateNIC")]
    public async Task<HttpResponseData> ValidateNIC(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "validate")] HttpRequestData req)
    {
        _logger.LogInformation("Validating NIC...");
        var body = await req.ReadFromJsonAsync<AppointmentDTO>();
        if (body == null || string.IsNullOrEmpty(body.NIC))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteStringAsync("NIC is required.");
            return errorResponse;
        }

        var customer = await _repository.GetCustomerByNIC(body.NIC);
        if (customer == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteStringAsync("Customer not found.");
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new CustomerResponse(customer.NIC, customer.Name));
        return response;
    }

    [Function("ScheduleAppointment")]
    public async Task<HttpResponseData> ScheduleAppointment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "schedule")] HttpRequestData req)
    {
        _logger.LogInformation("Scheduling appointment...");
        var body = await req.ReadFromJsonAsync<AppointmentDTO>();
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        var validationResult = await _validator.ValidateAsync(body);
        if (!validationResult.IsValid)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteAsJsonAsync(validationResult.Errors);
            return badResponse;
        }

        var customer = await _repository.GetCustomerByNIC(body.NIC);
        if (customer == null) return req.CreateResponse(HttpStatusCode.NotFound);

        var hasPending = await _repository.HasPendingAppointment(customer.Id);
        if (hasPending)
        {
            var conflictResponse = req.CreateResponse(HttpStatusCode.Conflict);
            await conflictResponse.WriteAsJsonAsync(new { Message = "Customer already has a pending appointment." });
            return conflictResponse;
        }

        await _repository.ScheduleAppointment(customer.Id, body.Date, body.Slot);
        
        var successResponse = req.CreateResponse(HttpStatusCode.OK);
        await successResponse.WriteAsJsonAsync(new { Message = "Appointment scheduled successfully." });
        return successResponse;
    }
}
