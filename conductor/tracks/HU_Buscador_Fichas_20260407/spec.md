# Track Spec: HU - Buscador en Fichas de Monitoreo

## Visión General (Overview)
Implementar una funcionalidad de búsqueda y filtrado local en la pantalla de Fichas de Monitoreo (Sheets) para facilitar la localización de instrumentos específicos mediante texto. Se reutilizará la lógica y los componentes de UI ya implementados en la pantalla de Planes.

## Requerimientos Funcionales
- **Componente de Búsqueda:** Reutilizar el componente de búsqueda (actualmente PlanSearchBar), asegurando que sea genérico para ambas pantallas.
- **Filtrado Dinámico:** Filtrado local en tiempo real con un debounce de 300ms.
- **Criterios de Coincidencia (MonitoringInstrument):** 
    - Búsqueda en los campos: name (Nombre de la Ficha), code (Código de la Ficha) y otros metadatos como enuType o descripciones visibles.
    - Insensible a mayúsculas/minúsculas.
    - Ignorar espacios en blanco al inicio y al final (Trim).
- **Restauración:** Al limpiar el buscador, se debe mostrar el listado completo original de fichas del plan seleccionado.
- **Estado Vacío:** Mostrar el componente visual de "sin resultados" (reutilizar PlanEmptyState).
- **Posición UI:** El buscador será fijo (Sticky) debajo del header de la pantalla.

## Requerimientos No Funcionales
- **Consistencia:** El comportamiento y diseño deben ser idénticos al buscador de Planes de Monitoreo.
- **Arquitectura:** Mantener el filtrado desacoplado de la carga de datos (fetch) desde el store.

## Criterios de Aceptación
- El buscador aparece correctamente en la pantalla de Fichas.
- El filtrado se activa tras 300ms de inactividad al escribir.
- Al borrar el texto, se recupera la lista original de fichas del plan actual.
- Se muestra el mensaje de "sin resultados" cuando no hay coincidencias.
- La navegación al detalle de la ficha (Samples) sigue funcionando tras el filtrado.

## Fuera de Alcance (Out of Scope)
- Búsqueda en el servidor por cada tecla.
- Modificaciones en la lógica de negocio de los instrumentos.
