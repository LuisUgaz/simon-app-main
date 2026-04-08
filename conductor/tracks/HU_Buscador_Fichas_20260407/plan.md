# Implementation Plan - HU - Buscador en Fichas de Monitoreo

Este plan detalla los pasos para implementar el buscador en la pantalla de Fichas, reutilizando la infraestructura ya creada en Planes.

## Fase 1: Refactorización a Componentes Compartidos (Shared)
- [x] **Tarea: Mover y renombrar componentes de búsqueda**
    - [x] Mover PlanSearchBar.tsx a src/presentation/components/shared/SearchBar.tsx.
    - [x] Mover PlanEmptyState.tsx a src/presentation/components/shared/EmptyState.tsx.
    - [x] Actualizar importaciones en PlansScreen.tsx para usar los nuevos componentes compartidos.
    - [x] Verificar que la búsqueda en Planes sigue funcionando correctamente tras el cambio.

## Fase 2: Infraestructura de Pruebas para SheetsScreen
- [x] **Tarea: Configurar entorno de pruebas para SheetsScreen**
    - [x] Crear archivo de prueba SheetsScreen.test.tsx en src/presentation/screens/monitoring/sheets/__tests__/.
    - [x] Mockear useMonitoringStore para simular la lista de instrumentos (fichas).
    - [x] Verificar que la pantalla renderiza la lista inicial de fichas.

## Fase 3: Lógica de Filtrado en SheetsScreen (TDD)
- [x] **Tarea: Implementar lógica de búsqueda y filtrado**
    - [x] **Pruebas:** Escribir tests que verifiquen la presencia del buscador y que el filtrado ocurra tras el debounce de 300ms.
    - [x] **Implementación:** 
        - Agregar estados searchQuery y filteredInstruments en SheetsScreen.
        - Implementar useEffect para el filtrado dinámico basándose en name y code de las fichas.
- [x] **Tarea: Integración en la UI de SheetsScreen**
    - [x] **Pruebas:** Verificar que el buscador es visible y que aparece el EmptyState cuando no hay resultados.
    - [x] **Implementación:**
        - Insertar SearchBar en SheetsScreen de forma Sticky.
        - Condicionar el renderizado de SheetsList o EmptyState.

## Fase 4: Verificación y Cierre
- [x] **Tarea: Pruebas de integración final**
    - [x] Validar que la navegación al seleccionar una ficha filtrada sigue funcionando (hacia la pantalla Samples).
    - [x] Confirmar que el borrado de la búsqueda restaura todas las fichas del plan.
- [x] **Tarea: Conductor - User Manual Verification (Finalización de Track)**
