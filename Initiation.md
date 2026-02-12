# Guía de Iniciación Local - FieldConnect

Sigue estos pasos para configurar y ejecutar el proyecto FieldConnect en tu entorno local.

## Requisitos Previos
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js v18+](https://nodejs.org/)
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)

## 1. Configuración del Backend (/api)

Abre una terminal en la carpeta `api` y sigue estos pasos:

1. **Instalar dependencias**:
   ```bash
   dotnet restore
   ```

2. **Configurar el entorno**:
   Asegúrate de que el archivo `local.settings.json` tenga los secretos necesarios (JWT_SECRET, etc.).

3. **Ejecutar la API**:
   ```bash
   func start
   ```
   *La API correrá por defecto en `http://localhost:7071`.*

## 2. Configuración del Frontend (/web)

Abre otra terminal en la carpeta `web` y sigue estos pasos:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Crea o edita el archivo `.env` con el siguiente contenido:
   ```env
   VITE_API_URL=http://localhost:7071/api
   ```

3. **Ejecutar la App**:
   ```bash
   npm run dev
   ```
   *Accede a la aplicación en `http://localhost:5173`.*

## 3. Pruebas de Seguridad
- El NIC de prueba por defecto es `123456`.
- Una vez logueado, el token JWT se almacenará en el navegador y se enviará automáticamente en cada petición mediante Axios Interceptors.
- Las rutas de agenda están protegidas y devolverán `401 Unauthorized` si intentas acceder sin un token válido.

---
**Electra 2026 - Conectando el campo con seguridad.**
