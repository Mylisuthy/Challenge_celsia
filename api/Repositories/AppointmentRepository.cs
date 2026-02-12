using System.Data;
using Dapper;
using Microsoft.Data.Sqlite;
using FieldConnect.Api.Models;

namespace FieldConnect.Api.Repositories;

public interface IAppointmentRepository
{
    Task<User?> GetUserByNIC(string nic);
    Task<User?> Login(string nic, string password);
    Task<User?> GetUserByEmail(string email);
    Task<int> CreateUser(User user);
    Task<User?> GetUserById(int id);
    Task<int> UpdateProfile(int userId, ProfileUpdateDTO profile);
    Task<bool> HasPendingAppointment(int customerId);
    Task<bool> HasAppointmentOnDate(int customerId, string date);
    Task<int> ScheduleAppointment(int customerId, string date, string slot, string time, int? specialistId = null);
    Task<User?> GetSpecialistWithLeastWork(string date, string slot);
    Task<object> GetAdminStats();
    Task<IEnumerable<object>> GetUserAppointments(int customerId);
    Task<IEnumerable<object>> GetSpecialistAppointments(int specialistId);
    Task<int> UpdateAppointmentStatus(int appointmentId, string status);
    Task<int> ReassignSpecialist(int appointmentId, int specialistId);
    Task<IEnumerable<object>> GetAllSpecialists();
    Task<IEnumerable<object>> GetAllAppointmentsAdmin();
    Task<int> CancelAppointment(int appointmentId);
    Task<IEnumerable<User>> SearchCustomers(string query);
    Task<IEnumerable<object>> GetCustomerAppointmentsAdmin(int customerId);
    Task<int> DeleteUser(int userId);
    Task<IEnumerable<string>> GetPendingAppointmentDates(int userId);
}

public class AppointmentRepository : IAppointmentRepository
{
    private readonly string _connectionString;
    private readonly IDbConnection _testConnection;

    public AppointmentRepository(string databasePath, IDbConnection testConnection = null)
    {
        _connectionString = $"Data Source={databasePath}";
        _testConnection = testConnection;
    }

    private IDbConnection CreateConnection() 
    {
        if (_testConnection != null) return _testConnection;
        return new SqliteConnection(_connectionString);
    }

    public async Task<User?> GetUserByNIC(string nic)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE NIC = @nic", new { nic });
    }

    public async Task<User?> Login(string nic, string password)
    {
        // Password verification is now handled in the Service/Function layer using BCrypt
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE NIC = @nic", 
            new { nic });
    }

    public async Task<User?> GetUserByEmail(string email)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Email = @email", new { email });
    }

    public async Task<User?> GetUserById(int id)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Id = @id", new { id });
    }

    public async Task<bool> HasPendingAppointment(int customerId)
    {
        using var db = CreateConnection();
        var count = await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Appointments WHERE CustomerId = @customerId AND Status = 'Pending'",
            new { customerId });
        return count > 0;
    }

    public async Task<bool> HasAppointmentOnDate(int customerId, string date)
    {
        using var db = CreateConnection();
        var count = await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Appointments WHERE CustomerId = @customerId AND Date = @date AND Status != 'Cancelada'",
            new { customerId, date });
        return count > 0;
    }

    public async Task<int> ScheduleAppointment(int customerId, string date, string slot, string time, int? specialistId = null)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync(
            "INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Time) VALUES (@customerId, @specialistId, @date, @slot, @time)",
            new { customerId, specialistId, date, slot, time });
    }

    public async Task<int> CreateUser(User user)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync(@"
            INSERT INTO Users (NIC, Name, Email, Password, Role, Address, Phone, BackupPhone)
            VALUES (@NIC, @Name, @Email, @Password, @Role, @Address, @Phone, @BackupPhone)", 
            user);
    }

    public async Task<int> UpdateProfile(int userId, ProfileUpdateDTO profile)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync(@"
            UPDATE Users SET Name = @Name, Address = @Address, Phone = @Phone, BackupPhone = @BackupPhone, Email = @Email
            WHERE Id = @userId", 
            new { profile.Name, profile.Address, profile.Phone, profile.BackupPhone, profile.Email, userId });
    }

    public async Task<User?> GetSpecialistWithLeastWork(string date, string slot)
    {
        using var db = CreateConnection();
        // Logic: Find specialist with fewer appointments in that slot, or any available
        return await db.QueryFirstOrDefaultAsync<User>(@"
            SELECT s.* FROM Users s
            LEFT JOIN Appointments a ON s.Id = a.SpecialistId AND a.Date = @date AND a.Slot = @slot
            WHERE s.Role = 'Specialist'
            GROUP BY s.Id
            ORDER BY COUNT(a.Id) ASC
            LIMIT 1", new { date, slot });
    }

    public async Task<object> GetAdminStats()
    {
        using var db = CreateConnection();
        var totalUsers = await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM Users WHERE Role = 'User'");
        var totalSpecialists = await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM Users WHERE Role = 'Specialist'");
        var totalAppointments = await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM Appointments");
        
        var statsByStatus = await db.QueryAsync(@"
            SELECT Status, COUNT(1) as Count 
            FROM Appointments 
            GROUP BY Status");

        return new {
            TotalUsers = totalUsers,
            TotalSpecialists = totalSpecialists,
            TotalAppointments = totalAppointments,
            StatusDistribution = statsByStatus
        };
    }

    public async Task<IEnumerable<object>> GetUserAppointments(int customerId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync(@"
            SELECT a.*, u.Name as SpecialistName 
            FROM Appointments a
            LEFT JOIN Users u ON a.SpecialistId = u.Id
            WHERE a.CustomerId = @customerId
            ORDER BY a.Date DESC, a.Slot DESC", new { customerId });
    }

    public async Task<IEnumerable<object>> GetSpecialistAppointments(int specialistId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync(@"
            SELECT a.*, u.Name as CustomerName, u.Address, u.Phone 
            FROM Appointments a
            JOIN Users u ON a.CustomerId = u.Id
            WHERE a.SpecialistId = @specialistId AND a.Status != 'Completada'
            ORDER BY a.Date ASC, a.Slot ASC", new { specialistId });
    }

    public async Task<int> UpdateAppointmentStatus(int appointmentId, string status)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("UPDATE Appointments SET Status = @status WHERE Id = @appointmentId", 
            new { appointmentId, status });
    }

    public async Task<int> ReassignSpecialist(int appointmentId, int specialistId)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("UPDATE Appointments SET SpecialistId = @specialistId WHERE Id = @appointmentId", 
            new { appointmentId, specialistId });
    }

    public async Task<IEnumerable<object>> GetAllSpecialists()
    {
        using var db = CreateConnection();
        return await db.QueryAsync(@"
            SELECT u.Id, u.NIC, u.Name, u.Email, u.Phone,
            (SELECT COUNT(1) FROM Appointments WHERE SpecialistId = u.Id AND Status IN ('Pending', 'Active', 'EnCamino')) as CurrentLoad
            FROM Users u
            WHERE u.Role = 'Specialist'");
    }

    public async Task<IEnumerable<object>> GetAllAppointmentsAdmin()
    {
        using var db = CreateConnection();
        return await db.QueryAsync(@"
            SELECT a.*, c.Name as CustomerName, c.NIC as CustomerNIC, s.Name as SpecialistName
            FROM Appointments a
            JOIN Users c ON a.CustomerId = c.Id
            LEFT JOIN Users s ON a.SpecialistId = s.Id
            ORDER BY a.Date DESC, a.Slot DESC");
    }

    public async Task<int> CancelAppointment(int appointmentId)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("UPDATE Appointments SET Status = 'Cancelada' WHERE Id = @appointmentId", 
            new { appointmentId });
    }

    public async Task<IEnumerable<User>> SearchCustomers(string query)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<User>(@"
            SELECT * FROM Users 
            WHERE Role = 'User' 
            AND (NIC LIKE @q OR Name LIKE @q)
            LIMIT 10", new { q = $"%{query}%" });
    }

    public async Task<IEnumerable<object>> GetCustomerAppointmentsAdmin(int customerId)
    {
        return await GetUserAppointments(customerId);
    }

    public async Task<int> DeleteUser(int userId)
    {
        using var db = CreateConnection();
        // Option: Nullify specialist assignments instead of blocking delete
        await db.ExecuteAsync("UPDATE Appointments SET SpecialistId = NULL WHERE SpecialistId = @userId", new { userId });
        return await db.ExecuteAsync("DELETE FROM Users WHERE Id = @userId", new { userId });
    }

    public async Task<IEnumerable<string>> GetPendingAppointmentDates(int userId)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<string>(
            "SELECT Date FROM Appointments WHERE CustomerId = @userId AND Status = 'Pending'",
            new { userId });
    }
}
