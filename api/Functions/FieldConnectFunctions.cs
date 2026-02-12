using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FieldConnect.Api.Models;
using FieldConnect.Api.Repositories;
using FieldConnect.Api.Services;
using FluentValidation;

namespace FieldConnect.Api.Functions;

public class FieldConnectFunctions
{
    private readonly ILogger<FieldConnectFunctions> _logger;
    private readonly IAppointmentRepository _repository;
    private readonly IValidator<AppointmentDTO> _validator;
    private readonly IAuthService _authService;
    private readonly IValidationService _validationService;

    public FieldConnectFunctions(
        ILogger<FieldConnectFunctions> logger,
        IAppointmentRepository repository,
        IValidator<AppointmentDTO> validator,
        IAuthService authService,
        IValidationService validationService)
    {
        _logger = logger;
        _repository = repository;
        _validator = validator;
        _authService = authService;
        _validationService = validationService;
    }

    [Function("Login")]
    public async Task<HttpResponseData> Login(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "login")] HttpRequestData req)
    {
        _logger.LogInformation("Authenticating User...");
        var body = await req.ReadFromJsonAsync<LoginRequest>();
        
        if (body == null || string.IsNullOrEmpty(body.NIC) || string.IsNullOrEmpty(body.Password))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteAsJsonAsync(new { Message = "NIC and Password are required." });
            return errorResponse;
        }

        var user = await _repository.Login(body.NIC, body.Password);
        if (user == null || !_authService.VerifyPassword(body.Password, user.Password))
        {
            var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorized.WriteAsJsonAsync(new { Message = "Credenciales inválidas." });
            return unauthorized;
        }

        var token = _authService.GenerateToken(user);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new { 
            user.NIC, 
            user.Name, 
            user.Role,
            Token = token 
        });
        return response;
    }

    [Function("ScheduleAppointment")]
    public async Task<HttpResponseData> ScheduleAppointment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "schedule")] HttpRequestData req)
    {
        _logger.LogInformation("Scheduling appointment with Auto-Assignment...");
        var body = await req.ReadFromJsonAsync<AppointmentDTO>();
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        var validationResult = await _validator.ValidateAsync(body);
        if (!validationResult.IsValid)
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteAsJsonAsync(validationResult.Errors);
            return badResponse;
        }

        var user = await _repository.GetUserByNIC(body.NIC);
        if (user == null) return req.CreateResponse(HttpStatusCode.NotFound);

        var pendingDates = await _repository.GetPendingAppointmentDates(user.Id);
        if (!_validationService.IsInSameWeekAsPending(body.Date, pendingDates))
        {
            var conflictResponse = req.CreateResponse(HttpStatusCode.Conflict);
            await conflictResponse.WriteAsJsonAsync(new { Message = "Solo se permite agendar múltiples citas si son para la misma semana de una cita ya pendiente." });
            return conflictResponse;
        }

        // AUTO ASSIGNMENT LOGIC
        var specialist = await _repository.GetSpecialistWithLeastWork(body.Date, body.Slot);
        
        await _repository.ScheduleAppointment(user.Id, body.Date, body.Slot, body.Time, specialist?.Id);
        
        var successResponse = req.CreateResponse(HttpStatusCode.OK);
        await successResponse.WriteAsJsonAsync(new { 
            Message = "Appointment scheduled successfully.",
            SpecialistName = specialist?.Name ?? "Unassigned"
        });
        return successResponse;
    }

    [Function("RegisterUser")]
    public async Task<HttpResponseData> RegisterUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "register")] HttpRequestData req)
    {
        _logger.LogInformation("Registering new user...");
        var user = await req.ReadFromJsonAsync<User>();
        if (user == null || string.IsNullOrEmpty(user.Name) || string.IsNullOrEmpty(user.NIC))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteAsJsonAsync(new { Message = "Name and NIC are required." });
            return bad;
        }

        var existing = await _repository.GetUserByNIC(user.NIC);
        if (existing != null)
        {
            var conflict = req.CreateResponse(HttpStatusCode.Conflict);
            await conflict.WriteAsJsonAsync(new { Message = "User already exists with this NIC." });
            return conflict;
        }

        user.Role = UserRoles.User; // Default for public register
        user.Password = _authService.HashPassword(user.Password);
        await _repository.CreateUser(user);
        return req.CreateResponse(HttpStatusCode.Created);
    }

    [Function("UpdateProfile")]
    public async Task<HttpResponseData> UpdateProfile(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "profile")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Updating user profile...");
        if (!context.Items.TryGetValue("UserId", out var userIdObj)) return req.CreateResponse(HttpStatusCode.Unauthorized);
        var userIdStr = userIdObj?.ToString();
        if (string.IsNullOrEmpty(userIdStr)) return req.CreateResponse(HttpStatusCode.Unauthorized);

        var body = await req.ReadFromJsonAsync<ProfileUpdateDTO>();
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        await _repository.UpdateProfile(int.Parse(userIdStr), body);
        return req.CreateResponse(HttpStatusCode.OK);
    }

    [Function("GetCustomerByNIC")]
    public async Task<HttpResponseData> GetCustomerByNIC(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/customer/{nic}")] HttpRequestData req,
        string nic,
        FunctionContext context)
    {
        _logger.LogInformation($"Admin looking up customer: {nic}");
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var user = await _repository.GetUserByNIC(nic);
        if (user == null) return req.CreateResponse(HttpStatusCode.NotFound);

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(user);
        return response;
    }

    [Function("CreateSpecialist")]
    public async Task<HttpResponseData> CreateSpecialist(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/specialists/create")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Admin creating new specialist...");
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var user = await req.ReadFromJsonAsync<User>();
        if (user == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        if (string.IsNullOrEmpty(user.NIC) || string.IsNullOrEmpty(user.Password) || string.IsNullOrEmpty(user.Email))
        {
            var res = req.CreateResponse(HttpStatusCode.BadRequest);
            await res.WriteAsJsonAsync(new { Message = "NIC, Email and Password are required." });
            return res;
        }

        user.Role = UserRoles.Specialist;
        user.Password = _authService.HashPassword(user.Password);
        
        try 
        {
            await _repository.CreateUser(user);
            return req.CreateResponse(HttpStatusCode.OK);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating specialist");
            var res = req.CreateResponse(HttpStatusCode.InternalServerError);
            await res.WriteAsJsonAsync(new { Message = "Error al crear el especialista. Posible NIC duplicado." });
            return res;
        }
    }

    [Function("GetProfile")]
    public async Task<HttpResponseData> GetProfile(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "profile")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Fetching user profile...");
        if (!context.Items.TryGetValue("UserId", out var userIdObj)) return req.CreateResponse(HttpStatusCode.Unauthorized);
        
        var user = await _repository.GetUserById(int.Parse(userIdObj.ToString()));
        if (user == null) return req.CreateResponse(HttpStatusCode.NotFound);

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(user);
        return response;
    }

    [Function("GetMyAppointments")]
    public async Task<HttpResponseData> GetMyAppointments(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "appointments/me")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Fetching user appointments...");
        if (!context.Items.TryGetValue("UserId", out var userIdObj)) return req.CreateResponse(HttpStatusCode.Unauthorized);
        
        var appointments = await _repository.GetUserAppointments(int.Parse(userIdObj.ToString()));
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(appointments);
        return response;
    }

    [Function("GetAdminStats")]
    public async Task<HttpResponseData> GetAdminStats(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/stats")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Retrieving Admin Dashboard Metrics...");
        
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var stats = await _repository.GetAdminStats();
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(stats);
        return response;
    }

    [Function("GetSpecialistOrders")]
    public async Task<HttpResponseData> GetSpecialistOrders(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "specialist/orders")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Retrieving Specialist Orders...");
        context.Items.TryGetValue("UserRole", out var roleObj);
        context.Items.TryGetValue("UserId", out var userIdObj);
        var role = roleObj?.ToString();
        var userIdStr = userIdObj?.ToString();

        if (role != UserRoles.Specialist && role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);
        if (string.IsNullOrEmpty(userIdStr)) return req.CreateResponse(HttpStatusCode.Unauthorized);

        var orders = await _repository.GetSpecialistAppointments(int.Parse(userIdStr));
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(orders);
        return response;
    }

    [Function("UpdateStatus")]
    public async Task<HttpResponseData> UpdateStatus(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "appointments/status")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Updating appointment status...");
        context.Items.TryGetValue("UserRole", out var roleObj);
        var role = roleObj?.ToString();
        if (role != UserRoles.Specialist && role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var body = await req.ReadFromJsonAsync<UpdateStatusRequest>();
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        await _repository.UpdateAppointmentStatus(body.Id, body.Status);
        return req.CreateResponse(HttpStatusCode.OK);
    }

    [Function("ReassignOrder")]
    public async Task<HttpResponseData> ReassignOrder(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/reassign")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Admin reassigning order...");
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var body = await req.ReadFromJsonAsync<ReassignRequest>();
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        await _repository.ReassignSpecialist(body.AppointmentId, body.SpecialistId);
        return req.CreateResponse(HttpStatusCode.OK);
    }

    [Function("GetSpecialists")]
    public async Task<HttpResponseData> GetSpecialists(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/specialists")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Admin fetching specialists...");
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var specialists = await _repository.GetAllSpecialists();
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(specialists);
        return response;
    }

    [Function("GetAllAppointments")]
    public async Task<HttpResponseData> GetAllAppointments(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/appointments")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Admin fetching all appointments...");
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var appointments = await _repository.GetAllAppointmentsAdmin();
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(appointments);
        return response;
    }

    [Function("CancelAppointment")]
    public async Task<HttpResponseData> CancelAppointment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/cancel")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Admin cancelling appointment...");
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var body = await req.ReadFromJsonAsync<UpdateStatusRequest>();
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);

        await _repository.CancelAppointment(body.Id);
        return req.CreateResponse(HttpStatusCode.OK);
    }

    [Function("SearchCustomers")]
    public async Task<HttpResponseData> SearchCustomers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/customers/search")] HttpRequestData req,
        FunctionContext context)
    {
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var query = req.Query["q"];
        if (string.IsNullOrEmpty(query)) return req.CreateResponse(HttpStatusCode.BadRequest);

        var results = await _repository.SearchCustomers(query);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(results);
        return response;
    }

    [Function("GetCustomerAppointmentsAdmin")]
    public async Task<HttpResponseData> GetCustomerAppointmentsAdmin(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/customer/{id}/appointments")] HttpRequestData req,
        int id,
        FunctionContext context)
    {
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        var appointments = await _repository.GetCustomerAppointmentsAdmin(id);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(appointments);
        return response;
    }

    [Function("DeleteSpecialist")]
    public async Task<HttpResponseData> DeleteSpecialist(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "management/specialists/delete/{id}")] HttpRequestData req,
        int id,
        FunctionContext context)
    {
        var role = (context.Items.TryGetValue("UserRole", out var r) ? r?.ToString() : null);
        if (role != UserRoles.Admin) return req.CreateResponse(HttpStatusCode.Forbidden);

        await _repository.DeleteUser(id);
        return req.CreateResponse(HttpStatusCode.OK);
    }
}
