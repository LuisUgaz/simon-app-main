# Track Spec: HU - Navegación al inicio desde Fichas de Monitoreo

## Visión General (Overview)
Implementar un botón con icono (Home) en el header de la pantalla de Fichas de Monitoreo (SheetsScreen) para permitir al usuario regresar rápidamente a la pantalla principal de la aplicación.

## Requerimientos Funcionales
- **Visualización:** Agregar un icono de "Casa" (Home) visible en el header de la pantalla de Fichas de Monitoreo.
- **Interacción:** Al hacer clic en el icono, el usuario debe ser redirigido inmediatamente a la pantalla de Inicio (`Home`).
- **Navegación Interna:** Utilizar el método `navigation.navigate('Home')` en lugar de `popToTop()` para asegurar que se llegue explícitamente a la pantalla de inicio dentro del `StackNavigator`.

## Requerimientos No Funcionales
- **Consistencia Visual:** El nuevo botón debe mantener la misma estructura, estilos (espaciado, color, tamaño) y el uso de componentes reutilizables (como `RoundButton`) que el botón de regresar actual.
- **Funcionamiento actual:** La inserción de este botón no debe interferir con la navegación hacia atrás estándar ni con el botón de información actual.

## Criterios de Aceptación
- El ícono aparece correctamente en el header de la pantalla de fichas.
- Al pulsar el ícono, la aplicación navega a `Home`.
- La consistencia del diseño del header se mantiene intacta.
- El resto de funciones en la pantalla de fichas continúan operando sin errores.

## Fuera de Alcance
- Modificaciones en otras pantallas del stack.
- Cambios en la configuración global de navegación (`StackNavigator.tsx`).
- Refactorización masiva del header en un componente global (si no existe ya un patrón estricto a seguir).