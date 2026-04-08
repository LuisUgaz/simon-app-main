# Implementation Plan - HU - Buscador en Fichas de Monitoreo

Este plan detalla los pasos para implementar el buscador remoto en la pantalla de Fichas, reutilizando los componentes compartidos creados.

## Fase 1: Componentes Compartidos (Shared)
- [x] **Tarea: Utilizar componentes compartidos de UI**
    - [x] Importar `SearchBar` desde `src/presentation/components/shared/SearchBar.tsx`.
    - [x] Importar `EmptyState` desde `src/presentation/components/shared/EmptyState.tsx`.
    - [x] Verificar que la búsqueda en Planes use estos mismos componentes.

## Fase 2: Infraestructura de Pruebas para SheetsScreen
- [x] **Tarea: Configurar entorno de pruebas para SheetsScreen**
    - [x] Crear archivo de prueba `SheetsScreen.test.tsx`.
    - [x] Mockear `useMonitoringStore` para simular la API de búsqueda de instrumentos.

## Fase 3: Lógica de Búsqueda Remota en SheetsScreen
- [x] **Tarea: Implementar lógica de búsqueda remota con Debounce**
    - [x] Agregar estado `searchQuery` en `SheetsScreen.tsx`.
    - [x] Implementar `useEffect` con debounce de 300ms que dispare el `searchHandler`.
    - [x] Integrar `searchHandler` con el método `getInstruments` del store enviando el parámetro `query`.
    - [x] Asegurar el manejo de la paginación (`lastKey`) reiniciándola al iniciar una nueva búsqueda (`isNewSearch`).
- [x] **Tarea: Integración en la UI de SheetsScreen**
    - [x] Renderizar `SearchBar` sobre el listado de fichas.
    - [x] Condicionar el renderizado de `SheetsList` o `EmptyState` según los resultados de la búsqueda.

## Fase 4: Verificación y Cierre
- [x] **Tarea: Pruebas de integración final**
    - [x] Confirmar que la paginación de fichas funciona correctamente bajo filtros de búsqueda.
    - [x] Validar la navegación hacia `Samples` tras seleccionar una ficha de la lista filtrada.
- [x] **Tarea: Conductor - User Manual Verification (Finalización de Track)**
