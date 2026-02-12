# FieldConnect MVP

MVP de agendamiento de citas técnicas para Electra. Construido con .NET 9 y React 19.

## Tecnologías
- **Backend**: Azure Functions (Isolated Worker) .NET 9, Dapper, SQLite, FluentValidation.
- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide React.
- **Infraestructura**: Docker (Alpine), Azure Pipelines.

## Requisitos
- .NET 9 SDK
- Node.js 20+
- Azure Functions Core Tools (para ejecución local del backend)

## Estructura
- `/api`: Backend Azure Functions.
- `/web`: Frontend React.
- `/tests`: Pruebas unitarias para la regla de los 15 días.

## Instrucciones de Ejecución

### Backend
1. Navegue a la carpeta `api`.
2. Ejecute `dotnet restore`.
3. Ejecute `func start` (o `dotnet run` si tiene el host configurado).
   *Nota: El archivo de base de datos `fieldconnect.db` se creará automáticamente al iniciar por primera vez.*

### Frontend
1. Navegue a la carpeta `web`.
2. Ejecute `npm install`.
3. Ejecute `npm run dev`.
4. Acceda a `http://localhost:5173`.

### Pruebas
1. Navegue a la carpeta `tests`.
2. Ejecute `dotnet test`.

## Docker
Para construir la imagen del backend:
```bash
docker build -f api/Dockerfile -t fieldconnect-api .
```
