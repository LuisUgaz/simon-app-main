# Implementation Plan - HU - Buscador en Planes de Monitoreo

Este plan detalla los pasos seguidos para implementar la funcionalidad de búsqueda remota en la pantalla de Planes de Monitoreo.

## Fase 1: Preparación e Infraestructura de Pruebas
- [x] **Tarea: Configurar entorno de pruebas para PlansScreen**
    - [x] Crear archivo de prueba `PlansScreen.test.tsx`.
    - [x] Mockear `useMonitoringStore` y `useAuthStore` para simular la API de búsqueda.

## Fase 2: Componentes de UI (Shared)
- [x] **Tarea: Crear componentes genéricos de Búsqueda y Estado Vacío**
    - [x] Crear `src/presentation/components/shared/SearchBar.tsx`.
    - [x] Crear `src/presentation/components/shared/EmptyState.tsx`.
    - [x] Implementar iconos de búsqueda, limpiar y estilos estándar del proyecto.

## Fase 3: Lógica de Búsqueda Remota en PlansScreen
- [x] **Tarea: Integrar SearchBar y lógica de búsqueda remota con Debounce**
    - [x] Agregar estado `searchQuery` en `PlansScreen.tsx`.
    - [x] Implementar `useEffect` con debounce de 300ms que dispare el `searchHandler`.
    - [x] Integrar `searchHandler` con el método `getPlans` del store enviando el parámetro `query`.
    - [x] Asegurar el manejo de la paginación (`lastKey`) reiniciándola al iniciar una nueva búsqueda (`isNewSearch`).
- [x] **Tarea: Integrar EmptyState y Listado**
    - [x] Renderizar `EmptyState` cuando `plans.length === 0` tras una búsqueda sin resultados.
    - [x] Mantener el `SearchBar` visible sobre el listado de planes.

## Fase 4: Verificación y Cierre
- [x] **Tarea: Pruebas de integración y navegación**
    - [x] Confirmar que la paginación funciona correctamente mientras hay un filtro de búsqueda activo.
    - [x] Validar que al navegar a las fichas de un plan buscado, el flujo de la aplicación se mantiene coherente.
- [x] **Tarea: Conductor - User Manual Verification (Finalización de Track)**
