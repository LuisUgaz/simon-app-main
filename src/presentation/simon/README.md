# Módulo Simon para React Native

Este módulo contiene la migración de los componentes de formulario Simon desde Angular a React Native, siguiendo la misma estructura y funcionamiento.

## Estructura del Módulo

```
simon/
├── components/
│   ├── common/
│   │   └── DescriptionsDialog.tsx          # Diálogo para descripciones de opciones
│   ├── ResolveQuestionConfigurationForm/   # Componente principal que renderiza el tipo de pregunta
│   ├── ResolveQuestionOpcionMultiple/      # Componente para preguntas de opción múltiple
│   ├── ResolveQuestionCasillaVerificacion/ # Componente para casillas de verificación
│   ├── ResolveQuestionRankingEstrellas/    # Componente para ranking con estrellas
│   ├── ResolveQuestionCargaArchivos/       # Componente para carga de archivos
│   ├── ResolveQuestionCuadroTextoSimple/   # Componente para cuadro de texto simple
│   ├── ResolveQuestionCuadroComentario/    # Componente para cuadro de comentario
│   ├── ResolveQuestionCantidad/            # Componente para cantidades numéricas
│   └── ResolveQuestionFechaHora/           # Componente para fecha y hora
├── examples/
│   └── SimonFormExample.tsx                # Ejemplo de uso de los componentes
├── hooks/
│   └── useFormControl.ts                   # Hook para adaptar React Hook Form a API de Angular
├── interfaces/
│   ├── answer.ts                           # Interfaz para respuestas 
│   ├── configuration.ts                    # Interfaz para configuración
│   ├── format-other-option.ts              # Interfaz para formato de opción "Otro"
│   ├── index.ts                            # Exportaciones de interfaces
│   ├── interval-score.ts                   # Interfaz para intervalos de puntaje
│   ├── option.ts                           # Interfaz para opciones
│   ├── question-config.ts                  # Interfaz principal para configuración de preguntas
│   └── resolve.ts                          # Interfaz para renderización
├── services/
│   └── config.ts                           # Configuración de tipos de preguntas
├── utils/
│   └── merge-deep.ts                       # Utilidad para fusionar objetos
└── index.ts                                # Exportaciones del módulo
```

## Instalación de Dependencias

Para utilizar estos componentes, necesitarás instalar las siguientes dependencias:

```bash
# Dependencias básicas
npm install react-native-paper react-native-vector-icons react-hook-form

# Para el selector de fecha
npm install react-native-date-picker

# Para campos de selección (dropdown)
npm install react-native-input-select

# Para manejo de fechas
npm install dayjs

# Para la carga de archivos (si usas Expo)
npm install expo-document-picker
```

## Cómo Usar los Componentes

Los componentes migrados mantienen la misma API que sus equivalentes en Angular. El componente principal es `ResolveQuestionConfigurationForm`, que renderiza el tipo de pregunta adecuado según la configuración.

### Ejemplo Básico

```tsx
import React from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { 
  ResolveQuestionConfigurationForm, 
  useFormControl, 
  QuestionConfig 
} from '../simon';

// Configuración de una pregunta (normalmente vendría de una API)
const question: QuestionConfig = {
  type: 'TYPE_01', // Opción múltiple
  name: 'Opción múltiple',
  // ... resto de la configuración
};

const ExampleForm = () => {
  const { control } = useForm();
  
  // Crear controles para la pregunta
  const questionControl = useFormControl('question1', control, { required: true });
  const otherControl = useFormControl('question1_other', control);
  
  return (
    <View>
      <ResolveQuestionConfigurationForm
        number={1}
        question={question}
        control={questionControl}
        controlOther={otherControl}
        readOnly={false}
        onChangeValue={(value) => console.log('Valor cambiado:', value)}
      />
    </View>
  );
};
```

## Tipos de Preguntas Soportados

1. `TYPE_01`: **Opción múltiple** - `ResolveQuestionOpcionMultiple`
2. `TYPE_02`: **Casillas de verificación** - `ResolveQuestionCasillaVerificacion`
3. `TYPE_03`: **Ranking de estrellas** - `ResolveQuestionRankingEstrellas`
4. `TYPE_04`: **Carga de archivos** - `ResolveQuestionCargaArchivos`
5. `TYPE_05`: **Cuadro de texto simple** - `ResolveQuestionCuadroTextoSimple`
6. `TYPE_06`: **Cuadro de comentario** - `ResolveQuestionCuadroComentario`
7. `TYPE_07`: **Cantidad** - `ResolveQuestionCantidad`
8. `TYPE_08`: **Fecha** - `ResolveQuestionFechaHora`

## Propiedades del Componente Principal

```tsx
interface Props {
  number: number;                // Número de pregunta
  question: QuestionConfig;      // Configuración completa de la pregunta
  codigoItem?: any;              // Código del ítem
  readOnly?: boolean;            // Modo lectura
  control: any;                  // Control principal del formulario
  controlOther?: any;            // Control para opción "Otro"
  controlSize?: any;             // Control para tamaño de archivos
  controlExtension?: any;        // Control para extensión de archivos
  controlNameFile?: any;         // Control para nombre de archivos
  onChangeValue?: (value: any) => void; // Evento cuando cambia el valor
}
```

## Notas de Implementación

### Componentes con Dependencias Específicas

1. **ResolveQuestionFechaHora**: Usa `react-native-date-picker` para la selección de fechas y horas.
2. **ResolveQuestionOpcionMultiple** y **ResolveQuestionCasillaVerificacion**: Usan `react-native-input-select` para los campos de selección desplegable.
3. **ResolveQuestionCargaArchivos**: Utiliza `expo-document-picker` para la selección de archivos.
4. Se utiliza `dayjs` para el formateo de fechas de manera consistente.

### Adaptaciones a React Native

- Se ha adaptado la estructura del código de Angular a React y React Native.
- Se utiliza `useFormControl` para simular el comportamiento de `FormControl` de Angular.
- Los componentes siguen patrones de diseño de React Native en lugar de Angular Material.
- Se han adaptado los componentes para usar bibliotecas comunes en el ecosistema React Native.

Para más ejemplos, consulta el archivo `examples/SimonFormExample.tsx`. 