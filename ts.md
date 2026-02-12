# Technical Specification: FieldConnect Ecosystem (ts.md)

Este documento proporciona el estado técnico actual, la arquitectura y los componentes detallados de la plataforma **FieldConnect**. Su propósito es servir como referencia maestra para la reconstrucción del documento de la solución.

---

## 🚀 1. Estado Actual del Sistema
La plataforma se encuentra en una fase **Alpha Estable (v1.5)** con el core de negocio totalmente operativo. Se han implementado las capas de Front-end, Back-end (Serverless) y Base de Datos con persistencia real.

**Hito Reciente:** Sincronización completa de reglas de negocio flexibles (Agrupamiento semanal y reducción de tiempos de espera).

---

## 🏗 2. Arquitectura de Componentes

### A. Backend (Azure Functions - Isolated Worker)
Implementado en **.NET 9.0**, utiliza un modelo de ejecución fuera de proceso para máxima estabilidad.
- **`FieldConnectFunctions.cs`**: Punto de entrada de la API. Gestiona triggers HTTP para Login, Registro, Agendamiento y Gestión Administrativa.
- **`AppointmentRepository.cs`**: Implementación del patrón Repositorio usando **Dapper**. Maneja toda la persistencia en SQLite con consultas optimizadas.
- **`ValidationService.cs`**: Capa de lógica de negocio pura. Contiene las reglas de validación de fechas y el motor de "Clustering" (Agrupación).
- **`JwtMiddleware.cs`**: Middleware de seguridad que intercepta cada petición, valida la firma del token y normaliza las rutas para RBAC (Control de Acceso Basado en Roles).

### B. Frontend (React + Vite)
SPA construida con **React 18** y **Tailwind CSS v4**, enfocada en una experiencia de usuario (UX) premium.
- **`AuthContext.jsx`**: Gestiona el estado global de la sesión y la persistencia en `localStorage`.
- **`BookingPage.jsx`**: Interfaz de agendamiento inteligente con buscador de clientes por NIC/Nombre y visualización de historial en tiempo real.
- **`AdminDashboard.jsx`**: Panel de control con pestañas para Métricas, Gestión de Técnicos (CRUD) y Supervisión de Citas con override de estados.
- **`SpecialistDashboard.jsx`**: Vista enfocada a la ejecución de tareas en campo para los técnicos.

### C. Base de Datos (SQLite)
Base de Datos relacional ligera enfocada en portabilidad.
- **Tabla `Users`**: Multirrol (Admin, Specialist, User).
- **Tabla `Appointments`**: Almacena citas, vinculando clientes con técnicos y horas específicas.

---

## 🛡 3. Reglas de Negocio Vitales (Business Logic)

| Regla | Descripción | Componente Validador |
| :--- | :--- | :--- |
| **Anticipación (Lead Time)** | Mínimo **5 días** de anticipación para cualquier cita nueva. | `ValidationService.IsDateValid` |
| **Agrupamiento (Clustering)** | Un cliente solo puede tener múltiples citas si pertenecen a la **misma semana** calendaria. | `ValidationService.IsInSameWeekAsPending` |
| **Rango Horario** | Citas permitidas entre las **08:00** y las **20:00** (8 PM). | `AppointmentValidator.cs` |
| **Asignación Automática** | El sistema asigna al técnico disponible con menor carga laboral para la fecha/jornada. | `AppointmentRepository.GetSpecialistWithLeastWork` |

---

## 🛠 4. Infraestructura y DevOps

- **Pipeline CI/CD (`azure-pipelines.yml`)**: Automatización completa en Azure DevOps. Realiza:
  1. Restauración de dependencias.
  2. Compilación del proyecto (`Release`).
  3. Ejecución de Tests Unitarios (validando la regla de 5 días y clustering).
  4. Publicación de resultados de prueba.
- **Testing (`FieldConnect.Tests`)**: Suite de XUnit con cobertura sobre:
  - Lógica de validación de fechas.
  - Generación y seguridad de Tokens JWT.
  - Integridad de Repositorios (usando DBs en memoria).

---

## 🔑 5. Guía de Uso Rápido

### Perfiles de Acceso (Seeds)
| Perfil | Usuario (NIC) | Password | Acción Principal |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADMIN01` | `admin123` | Control total, baja de técnicos, cambio de estados. |
| **Specialist** | `SPEC01` | `spec123` | Gestión de citas asignadas (Iniciar ruta, Finalizar). |
| **Customer** | `123456` | `pass123` | Agendamiento, perfil e historial de citas. |

### Comandos de Inicio (Local)
1. **API**: `cd api; func start` (Levanta el puerto 7071).
2. **WEB**: `cd web; npm install; npm run dev` (Levanta el puerto 5173).
3. **TEST**: `dotnet test` (Ejecuta las validaciones de sistema).

---
© 2026 **Electra S.A. | Technical Solutions Document**
