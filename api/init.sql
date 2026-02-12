-- FieldConnect Database Initialization
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS Customers (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    NIC TEXT UNIQUE NOT NULL,
    Name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Appointments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    CustomerId INTEGER NOT NULL,
    Date TEXT NOT NULL, -- Format: YYYY-MM-DD
    Slot TEXT NOT NULL, -- 'AM' or 'PM'
    Status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled'
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);

-- Seed Data (Optional for testing)
INSERT OR IGNORE INTO Customers (NIC, Name) VALUES ('123456', 'Juan Perez');
INSERT OR IGNORE INTO Customers (NIC, Name) VALUES ('789012', 'Maria Garcia');
