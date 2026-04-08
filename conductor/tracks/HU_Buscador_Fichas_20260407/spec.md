# Track Spec: HU - Buscador en Fichas de Monitoreo

## Visión General (Overview)
Implementar una funcionalidad de búsqueda y filtrado remoto en la pantalla de Fichas de Monitoreo (Sheets) para facilitar la localización de instrumentos específicos mediante texto, integrando la búsqueda con la paginación de la API. Se reutilizarán los componentes compartidos de UI desarrollados para Planes.

## Requerimientos Funcionales
- **Componente de Búsqueda:** Utilizar el componente compartido `SearchBar` localizado en `src/presentation/components/shared`.
- **Búsqueda Remota:** La búsqueda se realiza mediante una petición POST al backend enviando el parámetro `query` junto con el `idPlanMonitoreo`.
- **Debounce:** Mantener un debounce de 300ms para las llamadas a la API.
- **Paginación:** La búsqueda debe soportar la paginación por `lastKey`, reiniciándose al realizar una nueva búsqueda (`isNewSearch`).
- **Restauración:** Al limpiar el buscador, se debe recargar el listado completo original de fichas del plan actual (sin parámetro `query`).
- **Estado Vacío:** Utilizar el componente compartido `EmptyState` cuando la API no retorne coincidencias.
- **Posición UI:** El buscador será fijo sobre el listado de fichas, debajo del header.

## Requerimientos No Funcionales
- **Consistencia:** Mantener el mismo comportamiento de búsqueda remota y debounce que en la pantalla de Planes de Monitoreo.
- **Arquitectura:** Delegar la lógica de búsqueda al store (`getInstruments`) para centralizar las peticiones a la API.

## Criterios de Aceptación
- El buscador aparece correctamente integrado en la pantalla de Fichas.
- La búsqueda remota se activa tras 300ms de inactividad al escribir.
- Al borrar el texto, se recupera la lista completa de fichas asociada al plan actual.
- Se muestra el `EmptyState` compartido cuando no hay coincidencias.
- La navegación al detalle de la ficha (Samples) sigue funcionando tras el filtrado.

## Fuera de Alcance (Out of Scope)
- Filtrado local en el cliente de instrumentos ya cargados.
- Cambios en el modelo de datos de `MonitoringInstrument`.
