# Implementation Plan - HU - Buscador en Planes de Monitoreo

Este plan detalla los pasos para implementar la funcionalidad de búsqueda en la pantalla de Planes de Monitoreo.

## Fase 1: Preparación e Infraestructura de Pruebas
- [x] **Tarea: Configurar entorno de pruebas para PlansScreen**
    - [x] Crear archivo de prueba `PlansScreen.test.tsx` si no existe.
    - [x] Mockear `useMonitoringStore` y `useAuthStore` para simular datos de planes.
    - [x] Verificar que la pantalla renderiza la lista inicial de planes.

## Fase 2: Desarrollo del Componente de Búsqueda
- [x] **Tarea: Crear el componente PlanSearchBar**
    - [x] **Pruebas:** Escribir tests para verificar que el input recibe texto y llama a una función de callback.
    - [x] **Implementación:** Crear `src/presentation/screens/monitoring/plans/components/PlanSearchBar.tsx` usando `TextInput` de `react-native-paper` o nativo, con icono de búsqueda y botón de limpiar.
- [x] **Tarea: Crear el componente PlanEmptyState**
    - [x] **Pruebas:** Verificar que el componente renderiza el icono y el mensaje "No se encontraron resultados".
    - [x] **Implementación:** Crear `src/presentation/screens/monitoring/plans/components/PlanEmptyState.tsx`.

## Fase 3: Lógica de Filtrado en PlansScreen
- [x] **Tarea: Implementar lógica de filtrado con Debounce**
    - [x] **Pruebas:** Escribir tests que simulen la escritura en el buscador y verifiquen que la lista de planes se actualiza tras el retraso (debounce).
    - [x] **Implementación:** 
        - Agregar estado `searchQuery` en `PlansScreen`.
        - Implementar un `useEffect` con `setTimeout` (debounce 300ms) para filtrar la lista original de planes basándose en `name`, `code` y otros campos relevantes.
        - Asegurar que la búsqueda ignore mayúsculas/minúsculas y use `trim()`.
- [x] **Tarea: Integrar componentes en la UI**
    - [x] **Pruebas:** Verificar que el buscador es visible y que `PlanEmptyState` aparece cuando no hay coincidencias.
    - [x] **Implementación:**
        - Insertar `PlanSearchBar` en `PlansScreen` antes de la lista.
        - Condicionar el renderizado de `PlanList` o `PlanEmptyState` según el resultado del filtrado.
        - Asegurar que el buscador se mantenga "Sticky" (fijo) si la estructura lo permite (usar `ListHeaderComponent` si se migra a `FlatList` o manejarlo fuera del `ScrollView`).

## Fase 4: Verificación y Cierre
- [x] **Tarea: Pruebas de integración y navegación**
    - [x] Verificar que al seleccionar un plan filtrado, la navegación a la pantalla de hojas sigue funcionando correctamente.
    - [x] Validar el comportamiento de "limpiar búsqueda" y restauración de la lista completa.
- [x] **Tarea: Conductor - User Manual Verification (Finalización de Track)**
