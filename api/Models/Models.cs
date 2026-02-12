using System.Text.Json.Serialization;

namespace FieldConnect.Api.Models;

public record Customer(int Id, string NIC, string Name);

public record Appointment(int Id, int CustomerId, string Date, string Slot, string Status, DateTime CreatedAt);

public record AppointmentDTO(
    [property: JsonPropertyName("nic")] string NIC,
    [property: JsonPropertyName("date")] string Date,
    [property: JsonPropertyName("slot")] string Slot
);

public record CustomerResponse(string NIC, string Name);
