-- FieldConnect Database Initialization
-- FieldConnect - Advanced Platform Schema
PRAGMA journal_mode=WAL;

-- Drop existing tables if they exist to start fresh for the expansion
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    NIC TEXT UNIQUE, -- Nullable for Admin/Specialist
    Name TEXT NOT NULL,
    Email TEXT UNIQUE,
    Password TEXT, -- For Admin/Specialist or registered Users
    Role TEXT CHECK(Role IN ('Admin', 'Specialist', 'User')) NOT NULL DEFAULT 'User',
    Address TEXT,
    Phone TEXT,
    BackupPhone TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Appointments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    CustomerId INTEGER NOT NULL,
    SpecialistId INTEGER, -- To be assigned automatically or by admin
    Date TEXT NOT NULL,
    Slot TEXT CHECK(Slot IN ('AM', 'PM')) NOT NULL,
    Time TEXT, -- Specific time e.g. 08:00
    Status TEXT CHECK(Status IN ('Pending', 'Active', 'EnCamino', 'Completada', 'Cancelada')) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerId) REFERENCES Users(Id),
    FOREIGN KEY (SpecialistId) REFERENCES Users(Id)
);

-- Seed Initial Data
-- Admins (2)
INSERT INTO Users (NIC, Name, Email, Password, Role) VALUES ('ADMIN01', 'Super Admin Principal', 'admin@fieldconnect.com', '$2a$11$Z.y/jC/q/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P.', 'Admin');
INSERT INTO Users (NIC, Name, Email, Password, Role) VALUES ('ADMIN02', 'Admin de Soporte', 'soporte@fieldconnect.com', '$2a$11$Z.y/jC/q/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P.', 'Admin');

-- Specialists (3)
INSERT INTO Users (NIC, Name, Email, Password, Role) VALUES ('SPEC01', 'Enrique Técnico', 'enrique@fieldconnect.com', '$2a$11$a.b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y.', 'Specialist');
INSERT INTO Users (NIC, Name, Email, Password, Role) VALUES ('SPEC02', 'Laura Mantenimiento', 'laura@fieldconnect.com', '$2a$11$a.b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y.', 'Specialist');
INSERT INTO Users (NIC, Name, Email, Password, Role) VALUES ('SPEC03', 'Carlos Reparaciones', 'carlos@fieldconnect.com', '$2a$11$a.b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y.', 'Specialist');

-- Standard Users (5)
INSERT INTO Users (NIC, Name, Email, Password, Role, Address, Phone) VALUES ('123456', 'Juan Pérez', 'juan@test.com', '$2a$11$u.v/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R.', 'User', 'Calle 10 #20-30', '3001112233');
INSERT INTO Users (NIC, Name, Email, Password, Role, Address, Phone) VALUES ('789012', 'Maria Garcia', 'maria@test.com', '$2a$11$u.v/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R.', 'User', 'Av. Siempre Viva 123', '3104445566');
INSERT INTO Users (NIC, Name, Email, Password, Role, Address, Phone) VALUES ('112233', 'Roberto Gomez', 'roberto@test.com', '$2a$11$u.v/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R.', 'User', 'Diag 45 #12-09', '3207778899');
INSERT INTO Users (NIC, Name, Email, Password, Role, Address, Phone) VALUES ('445566', 'Ana Martinez', 'ana@test.com', '$2a$11$u.v/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R.', 'User', 'Transv 90 #10-10', '3159990011');
INSERT INTO Users (NIC, Name, Email, Password, Role, Address, Phone) VALUES ('778899', 'Luis Herrera', 'luis@test.com', '$2a$11$u.v/w/x/y/z/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R.', 'User', 'Manzana 4 Lote 2', '3112223344');

-- Sample Appointments to populate dashboards
-- Specialist 1: Busy with two tasks
INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Status) VALUES (6, 3, '2026-03-01', 'AM', 'Pending');
INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Status) VALUES (7, 3, '2026-03-01', 'PM', 'Active');

-- Specialist 2: One on route
INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Status) VALUES (8, 4, '2026-02-28', 'AM', 'EnCamino');

-- Specialist 3: Already finished some
INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Status) VALUES (9, 5, '2026-02-25', 'AM', 'Completada');
INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Status) VALUES (10, 5, '2026-02-25', 'PM', 'Completada');

-- A canceled one for metrics
INSERT INTO Appointments (CustomerId, SpecialistId, Date, Slot, Status) VALUES (6, 4, '2026-02-20', 'PM', 'Cancelada');
