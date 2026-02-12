using System.Data;
using Dapper;
using Microsoft.Data.Sqlite;
using FieldConnect.Api.Models;

namespace FieldConnect.Api.Repositories;

public interface IAppointmentRepository
{
    Task<Customer?> GetCustomerByNIC(string nic);
    Task<bool> HasPendingAppointment(int customerId);
    Task<int> ScheduleAppointment(int customerId, string date, string slot);
}

public class AppointmentRepository : IAppointmentRepository
{
    private readonly string _connectionString;

    public AppointmentRepository(string databasePath)
    {
        _connectionString = $"Data Source={databasePath}";
    }

    private IDbConnection CreateConnection() => new SqliteConnection(_connectionString);

    public async Task<Customer?> GetCustomerByNIC(string nic)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<Customer>(
            "SELECT * FROM Customers WHERE NIC = @nic", new { nic });
    }

    public async Task<bool> HasPendingAppointment(int customerId)
    {
        using var db = CreateConnection();
        var count = await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Appointments WHERE CustomerId = @customerId AND Status = 'Pending'",
            new { customerId });
        return count > 0;
    }

    public async Task<int> ScheduleAppointment(int customerId, string date, string slot)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync(
            "INSERT INTO Appointments (CustomerId, Date, Slot) VALUES (@customerId, @date, @slot)",
            new { customerId, date, slot });
    }
}
