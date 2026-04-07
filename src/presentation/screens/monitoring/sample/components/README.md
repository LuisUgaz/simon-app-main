# Componente InstrumentItemsForm

## Descripción
El componente `InstrumentItemsForm` es un formulario dinámico que muestra los items de un aspecto específico de un instrumento de monitoreo. Está diseñado para ser usado junto con el módulo Simon para renderizar diferentes tipos de preguntas.

## Características
- **Integración con Store**: Se conecta al store de monitoreo para obtener los items actuales
- **Formulario Dinámico**: Utiliza React Hook Form para la gestión del estado del formulario
- **Compatibilidad con Simon**: Convierte automáticamente los items del instrumento al formato compatible con Simon
- **Estado Vacío**: Muestra un mensaje informativo cuando no hay items disponibles
- **Ordenamiento**: Los items se muestran ordenados según su propiedad `order`
- **Estilo Consistente**: Utiliza la paleta de colores de la aplicación

## Uso

### Integración con InstrumentInfoDrawer
El componente se integra automáticamente con `InstrumentInfoDrawer.tsx`. Cuando un usuario selecciona un aspecto:

1. Se llama al método `getItemsByInstrumentAspect` del store
2. Los items se almacenan en `currentInstrumentItems` 
3. Se cambia automáticamente a la pestaña "Items"
4. Se renderizan los items usando el componente `InstrumentItemsForm`

### Flujo de Datos
```
Usuario selecciona aspecto → 
Store obtiene items → 
InstrumentItemsForm renderiza items → 
Usuario interactúa con formulario
```

## Tipos de Items Soportados
El componente soporta todos los tipos de items compatibles con Simon:
- `TYPE_01`: Opción múltiple
- `TYPE_02`: Casillas de verificación
- `TYPE_03`: Ranking de estrellas
- `TYPE_04`: Carga de archivos
- `TYPE_05`: Cuadro de texto simple
- `TYPE_06`: Área de texto
- `TYPE_07`: Número
- `TYPE_08`: Fecha

## Conversión de Datos
El componente incluye una función `convertItemToQuestionConfig` que mapea:
- `InstrumentItem` → `QuestionConfig` (formato Simon)
- `ItemConfiguration` → `Configuration` (Simon)
- `ItemResolve` → `Resolve` (Simon)
- `ItemOption[]` → `Option[]` (Simon)

## Estilos
El componente utiliza la paleta de colores de la aplicación:
- Primario: `#bf0909` (Rojo)
- Secundario: `#494949` (Gris oscuro)
- Acento: `#75a25d` (Verde)
- Fondo: `#f5f5f5` (Gris claro)

## Estados
- **Cargando**: Mientras se obtienen los datos del server
- **Con Datos**: Muestra los items del aspecto seleccionado
- **Vacío**: Muestra mensaje "Selecciona un aspecto para ver sus items"
- **Error**: Se maneja en el nivel del store y drawer

## Ejemplo de Uso Directo
```typescript
import { InstrumentItemsForm } from './components/InstrumentItemsForm';

// El componente se conecta automáticamente al store
<InstrumentItemsForm />
```

## Dependencias
- React Hook Form
- Simon Components
- Monitoring Store
- React Native Vector Icons 