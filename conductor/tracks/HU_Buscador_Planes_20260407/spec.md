# Track Spec: HU - Buscador en Planes de Monitoreo

## Visión General (Overview)
Implementar una funcionalidad de búsqueda y filtrado remoto en la pantalla de Planes de Monitoreo para facilitar la localización de planes específicos mediante texto, integrando la búsqueda con la paginación existente.

## Requerimientos Funcionales
- **Input de Búsqueda:** Campo de texto visible de forma fija sobre el listado de planes (reutilizando SearchBar shared).
- **Búsqueda Remota:** La búsqueda se realiza a través de llamadas al backend enviando el parámetro `query`.
- **Debounce:** Implementar un debounce de 300ms para evitar múltiples llamadas innecesarias a la API mientras el usuario escribe.
- **Paginación:** La búsqueda debe ser compatible con la paginación por `lastKey`. Al realizar una nueva búsqueda, se debe reiniciar la paginación.
- **Restauración:** Al limpiar el campo, se debe recargar el listado completo original (realizando una nueva petición sin query).
- **Estado Vacío:** Mostrar el componente `EmptyState` compartido cuando no haya coincidencias retornadas por la API.
- **Persistencia de Navegación:** La selección de un plan resultante de la búsqueda debe mantener el flujo de navegación existente.

## Requerimientos No Funcionales
- **Rendimiento:** Optimizar las llamadas al backend mediante el debounce.
- **Experiencia de Usuario:** El input debe estar optimizado para dispositivos móviles (teclado apropiado, botón de limpiar).
- **Consistencia:** Utilizar componentes compartidos (`SearchBar`, `EmptyState`) localizados en `src/presentation/components/shared`.

## Criterios de Aceptación (Escenarios)
- El input se visualiza correctamente al cargar la pantalla.
- La búsqueda remota se dispara tras el debounce de 300ms.
- Al borrar el texto, la lista se recarga con los datos iniciales (sin filtro).
- El mensaje de "sin resultados" aparece cuando la API retorna una lista vacía.
- La navegación sigue funcionando correctamente tras seleccionar un elemento filtrado.

## Fuera de Alcance (Out of Scope)
- Filtrado puramente local en el cliente (debido al volumen de datos y paginación).
- Rediseño completo de la interfaz de la pantalla.
