# Plan de Pruebas Manuales (TTTS) - FieldConnect MVP

Este documento detalla los pasos para verificar todas las funcionalidades del portal de autogestión de citas técnicas.

## 1. Verificación de Acceso (Login/NIC)
*   **Caso 1: NIC Válido**
    *   **Acción:** Ingresar el NIC `123456` y presionar "Entrar ahora".
    *   **Resultado esperado:** La aplicación debe validar con el backend, recibir un token JWT y redirigir a la página de agendamiento (`/booking`).
*   **Caso 2: NIC Inexistente**
    *   **Acción:** Ingresar un NIC que no exista (ej: `999999`).
    *   **Resultado esperado:** El sistema debe mostrar el mensaje: *"NIC no encontrado, por favor verifica tu factura."*
*   **Caso 3: Campo Vacío**
    *   **Acción:** Intentar entrar sin escribir nada.
    *   **Resultado esperado:** El botón debe estar deshabilitado o mostrar un error de validación local.

## 2. Agendamiento de Cita técnica
*   **Caso 1: Regla de los 15 días (Inválido)**
    *   **Acción:** Seleccionar una fecha cercana (ej: mañana mismo).
    *   **Resultado esperado:** Al intentar confirmar, el sistema debe mostrar un error indicando que se requieren **15 días de anticipación**.
*   **Caso 2: Regla de los 15 días (Válido)**
    *   **Acción:** Seleccionar una fecha con más de 15 días de margen (ej: en 3 semanas).
    *   **Resultado esperado:** La aplicación debe permitir avanzar a la selección de franja horaria.
*   **Caso 3: Selección de Franja (AM/PM)**
    *   **Acción:** Seleccionar "AM" y luego "PM".
    *   **Resultado esperado:** El botón seleccionado debe resaltar visualmente (color azul Electra) y el otro debe perder el foco.

## 3. Seguridad y Persistencia
*   **Caso 1: Acceso Directo Protegido**
    *   **Acción:** Intentar entrar a `http://localhost:5173/booking` sin haberse logueado.
    *   **Resultado esperado:** El sistema debe redirigir automáticamente a la página de inicio (Login).
*   **Caso 2: Token JWT**
    *   **Acción:** Abrir las herramientas de desarrollador (F12) -> Application -> Local Storage.
    *   **Resultado esperado:** Debe existir una entrada `customer` que contenga un campo `Token`.
*   **Caso 3: Cierre de Sesión por Error (401)**
    *   **Acción:** (Opcional para testers avanzados) Modificar el token manualmente en Local Storage para volverlo inválido e intentar agendar.
    *   **Resultado esperado:** El sistema debe detectar el error de autorización y redirigir al login.

## 4. Confirmación de Éxito
*   **Caso 1: Éxito Final**
    *   **Acción:** Completar un agendamiento válido.
    *   **Resultado esperado:** El sistema debe mostrar la pantalla de éxito con el mensaje de confirmación y Electra branding.

---
**Electra 2026 - Manual de Aseguramiento de Calidad.**
