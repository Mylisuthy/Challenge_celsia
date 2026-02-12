using System.Text.Json.Serialization;

namespace FieldConnect.Api.Models;

public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Specialist = "Specialist";
    public const string User = "User";
}

public class User
{
    public int Id { get; set; }
    public string? NIC { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string Role { get; set; } = UserRoles.User;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? BackupPhone { get; set; }
}

public class Appointment
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? SpecialistId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Slot { get; set; } = string.Empty; // Keep for legacy/categorization
    public string Time { get; set; } = string.Empty; // Specific time (e.g., '09:00')
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}

public class LoginRequest
{
    [JsonPropertyName("nic")]
    public string NIC { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class AppointmentDTO
{
    [JsonPropertyName("nic")]
    public string NIC { get; set; } = string.Empty;

    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;

    [JsonPropertyName("slot")]
    public string Slot { get; set; } = string.Empty;

    [JsonPropertyName("time")]
    public string Time { get; set; } = string.Empty;
}

public class ProfileUpdateDTO
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string BackupPhone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}

public class ReassignRequest
{
    [JsonPropertyName("appointmentId")]
    public int AppointmentId { get; set; }
    [JsonPropertyName("specialistId")]
    public int SpecialistId { get; set; }
}

public record CustomerResponse(string NIC, string Name, string Role);
