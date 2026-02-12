-- 1. Optimización para Azure Files (Modo WAL para evitar bloqueos)
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- 2. Tabla de Clientes (Soporte para US-01: Validación de NIC)
CREATE TABLE IF NOT EXISTS Customers (
    NIC TEXT PRIMARY KEY,
    FullName TEXT NOT NULL,
    DebtStatus INTEGER DEFAULT 0, -- 0: Al día, 1: Con deuda
    Zone TEXT NOT NULL
);

-- 3. Tabla de Citas (Soporte para US-02: Agendamiento)
CREATE TABLE IF NOT EXISTS Appointments (
    Id TEXT PRIMARY KEY,
    NIC TEXT NOT NULL,
    ScheduledDate TEXT NOT NULL,
    TimeSlot TEXT NOT NULL,
    Status TEXT DEFAULT 'Pending',
    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (NIC) REFERENCES Customers(NIC)
);

-- 4. Datos de prueba iniciales (Para validación inmediata)
INSERT OR IGNORE INTO Customers (NIC, FullName, DebtStatus, Zone) 
VALUES ('1234567', 'Usuario Prueba Electra', 0, 'Cali-Norte');

INSERT OR IGNORE INTO Customers (NIC, FullName, DebtStatus, Zone) 
VALUES ('7654321', 'Usuario Con Deuda', 1, 'Cali-Sur');