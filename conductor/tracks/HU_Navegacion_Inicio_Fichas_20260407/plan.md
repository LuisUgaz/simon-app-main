# Implementation Plan - HU - Navegación al inicio desde Fichas de Monitoreo

Este plan detalla los pasos para implementar el icono de navegación a Inicio en la pantalla de Fichas de Monitoreo.

## Fase 1: Desarrollo e Integración UI
- [x] **Tarea: Modificar SheetsScreen.tsx para incluir el nuevo icono**
    - [x] Importar (si no está disponible ya) o asegurarse de tener acceso a `navigation.navigate('Home')` dentro de `SheetsScreen`.
    - [x] Identificar la sección del header (`<View style={styles.rightSection}>`) en `SheetsScreen.tsx`.
    - [x] Insertar un nuevo componente `RoundButton` con la prop `icon="home"` (o su equivalente visual en Ionicons) antes del botón de información actual.
    - [x] Agregar el callback para la navegación: `action={() => navigation.navigate('Home')}`.
- [x] **Tarea: Ajustar estilos del header (si fuera necesario)**
    - [x] Verificar que el contenedor de los botones de la derecha (`styles.rightSection`) maneje correctamente el espaciado (gap) de dos elementos en lugar de uno.
- [x] **Tarea: Conductor - User Manual Verification 'Desarrollo e Integración UI' (Protocol in workflow.md)**

## Fase 2: Verificación (Pruebas)
- [x] **Tarea: Añadir o modificar prueba unitaria en SheetsScreen.test.tsx**
    - [x] Configurar el mock de `useNavigation` para que `navigate` simule la llamada y espere recibir el parámetro `'Home'`.
    - [x] Escribir una prueba que verifique la renderización del botón "Home" o similar.
    - [x] Validar en la prueba que al pulsar este botón, la función mockeada de navegación se llame con `'Home'`.
- [x] **Tarea: Conductor - User Manual Verification 'Verificación' (Protocol in workflow.md)**