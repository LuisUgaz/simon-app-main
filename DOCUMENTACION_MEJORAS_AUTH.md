# Documentación de Mejoras en Autenticación y Estabilidad

Este documento detalla los cambios realizados para solucionar el problema de interrupción indeseada (logout aleatorio) y mejorar la gestión de la sesión del usuario.

## 1. El Problema: Interrupción Indeseada

Antes, la aplicación sufría de cierres de sesión aleatorios.

**Causa:**
En `src/App.tsx`, existía un código que escuchaba **cada cambio de pantalla** (evento de navegación). Cada vez que el usuario navegaba, la App disparaba una petición `isAuthenticated()` al servidor.
Si esa petición fallaba por cualquier motivo (incluso una micro-interrupción de internet de 100ms, común en móviles, o un retraso en la respuesta), la lógica interpretaba erróneamente que el usuario no estaba autenticado y ejecutaba un `logout()` inmediato, sacando al usuario a la pantalla de Login.

**Solución:**
Se eliminó por completo este "listener" activo en `App.tsx`. La aplicación ya no pregunta activamente a cada momento si el usuario está logueado. En su lugar, asumimos que el usuario está logueado hasta que el servidor nos diga explícitamente lo contrario (Error 401).

---

## 2. La Solución Técnica: Lógica Reactiva en `AbstractApi`

Toda la inteligencia de la sesión se movió a `src/config/api/abstract.api.ts`, implementando un patrón de **Interceptor de Axios**.

### Flujo Paso a Paso de `abstract.api.ts`

El interceptor funciona como un "portero" que revisa todas las respuestas que llegan del servidor antes de que la App las procese.

#### Paso 1: Intercepción del Error 401
Cuando una petición normal falla con `status === 401` (Unauthorized), significa que el *Token de Acceso* ha caducado.
En lugar de lanzar el error a la pantalla (lo que causaría un crash o logout), el interceptor **pausa** la petición original.

#### Paso 2: Cola de Peticiones (Concurrency)
Si la App hace 5 peticiones simultáneas y el token vence, las 5 fallarían al mismo tiempo. Para evitar refrescar el token 5 veces (lo cual sería ineficiente y podría causar errores), usamos una variable `isRefreshing`.
*   Si ya se está refrescando el token, las nuevas peticiones fallidas se meten en una cola (`failedQueue`) y esperan.

#### Paso 3: Refresco de Token (Atomicity)
El interceptor hace una llamada interna especial a `RefreshToken` usando una instancia limpia de Axios (para evitar bucles infinitos).
*   Envía el `refreshToken` (cookie) y el `ApiKey`.
*   Si el servidor responde con éxito, nos da un nuevo `token` y posiblemente un nuevo `refreshToken`.

#### Paso 4: Reintento (Retry)
Una vez obtenido el nuevo token:
1.  Se actualiza en el almacenamiento local (`StorageAdapter`).
2.  Se actualizan los headers por defecto de Axios.
3.  **Se procesa la cola (`processQueue`)**: Todas las peticiones que estaban en espera se reintentan automáticamente con el nuevo token.
4.  El usuario **nunca se entera** de que su token venció; la App simplemente funciona.

#### Paso 5: Logout Definitivo (Fallback)
Si el intento de refresco falla (e.g., el `refreshToken` también expiró o el usuario fue bloqueado en el servidor), entonces y solo entonces, ejecutamos `AbstractApi.onLogout()`.
Esto dispara el cierre de sesión en el Store, limpiando los datos y llevando al usuario al Login.

---

## 3. Gestión de Inactividad (Seguridad)

Adicionalmente, para evitar el problema de "sesiones infinitas" donde un usuario podía dejar el móvil desbloqueado por horas:

*   Se implementó un `PanResponder` en `src/presentation/providers/AuthProvider.tsx`.
*   Este componente detecta cualquier toque en la pantalla.
*   Si el usuario no toca la pantalla por **30 minutos**, el sistema cierra la sesión automáticamente por seguridad.
