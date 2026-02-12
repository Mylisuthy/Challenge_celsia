using System.Data;
using Dapper;
using Microsoft.Data.Sqlite;
using FieldConnect.Api.Models;
using FieldConnect.Api.Repositories;
using Xunit;

namespace FieldConnect.Tests;

public class RepositoryTests : IDisposable
{
    private readonly string _dbPath;
    private readonly SqliteConnection _connection;
    private readonly AppointmentRepository _repository;

    public RepositoryTests()
    {
        _dbPath = $"test_{Guid.NewGuid()}.db";
        _connection = new SqliteConnection($"Data Source={_dbPath}");
        _connection.Open();
        
        InitializeDatabase();
        
        _repository = new AppointmentRepository(_dbPath);
    }

    private void InitializeDatabase()
    {
        var schema = @"
            CREATE TABLE Users (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                NIC TEXT UNIQUE,
                Name TEXT NOT NULL,
                Email TEXT UNIQUE,
                Password TEXT,
                Role TEXT NOT NULL,
                Address TEXT,
                Phone TEXT,
                BackupPhone TEXT,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE Appointments (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                CustomerId INTEGER NOT NULL,
                SpecialistId INTEGER,
                Date TEXT NOT NULL,
                Slot TEXT NOT NULL,
                Time TEXT,
                Status TEXT NOT NULL DEFAULT 'Pending',
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ";
        _connection.Execute(schema);
    }

    [Fact]
    public async Task GetAdminStats_ShouldReturnCorrectCounts()
    {
        // Arrange
        _connection.Execute("INSERT INTO Users (Name, Role, NIC) VALUES ('User 1', 'User', '123456')");
        _connection.Execute("INSERT INTO Users (Name, Role, NIC) VALUES ('Spec 1', 'Specialist', 'SPEC01')");
        _connection.Execute("INSERT INTO Appointments (CustomerId, Status, Date, Slot) VALUES (1, 'Pending', '2026-01-01', 'AM')");

        // Act
        var stats = await _repository.GetAdminStats();
        
        // Assert using reflection since it's an anonymous type
        var type = stats.GetType();
        var totalUsers = (int)type.GetProperty("TotalUsers").GetValue(stats);
        var totalSpecialists = (int)type.GetProperty("TotalSpecialists").GetValue(stats);
        var totalAppointments = (int)type.GetProperty("TotalAppointments").GetValue(stats);

        Assert.Equal(1, totalUsers);
        Assert.Equal(1, totalSpecialists);
        Assert.Equal(1, totalAppointments);
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
        if (File.Exists(_dbPath)) 
        {
            try { File.Delete(_dbPath); } catch {}
        }
    }
}
