# 🏗️ SIMON: Arquitectura Técnica de Componentes

## 🎯 Visión General de la Arquitectura

La plataforma **SIMON** implementa una arquitectura de componentes modulares basada en **React Native** con **TypeScript**, diseñada para capturar información educativa de manera eficiente y escalable. La arquitectura sigue principios de **componentización**, **reutilización** y **separación de responsabilidades**.

---

## 🏛️ **Arquitectura de Alto Nivel**

### **Patrón de Diseño:**
- **Component-Based Architecture**: Componentes reutilizables y modulares
- **Props-Driven Configuration**: Configuración dinámica mediante props
- **State Management**: Gestión de estado local con React Hooks
- **Form Control Integration**: Integración con sistema de formularios reactivos

### **Stack Tecnológico:**
- **Frontend**: React Native + TypeScript
- **UI Components**: React Native Paper
- **Icons**: React Native Vector Icons
- **Date Handling**: Day.js + React Native Date Picker
- **File Handling**: React Native Documents Picker
- **Styling**: StyleSheet API con temas personalizados

---

## 🔧 **Arquitectura por Tipo de Componente**

### 📋 **TYPE_01: Opción Múltiple (ResolveQuestionOpcionMultiple)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  controlOther?: any;             // Control para campo "Otro"
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Dropdown Personalizado**: Implementación nativa con TouchableOpacity
- **Radio Button System**: Selección única con estados visuales
- **Dynamic Field Rendering**: Campo "Otro" con tipos variables (TEXT/NUMBER/DATE)
- **Descriptions Dialog**: Modal para mostrar descripciones detalladas

#### **Estados de Gestión:**
```typescript
const [showOther, setShowOther] = useState(false);
const [showWithDescriptions, setShowWithDescriptions] = useState(false);
const [showDescriptionsDialog, setShowDescriptionsDialog] = useState(false);
const [isExpanded, setIsExpanded] = useState(false);
```

#### **Optimizaciones:**
- **useCallback**: Memoización de funciones para evitar re-renders
- **useRef**: Evita dependencias circulares en useEffect
- **Conditional Rendering**: Renderizado condicional basado en configuración

---

### ✅ **TYPE_02: Casillas de Verificación (ResolveQuestionCasillaVerificacion)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  controlOther?: any;             // Control para campo "Otro"
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Multi-Selection System**: Gestión de selección múltiple con arrays
- **Checkbox Grid**: Layout de checkboxes con estados individuales
- **Aggregated Display**: Visualización consolidada de selecciones
- **Validation Engine**: Validación de arrays y valores únicos

#### **Estados de Gestión:**
```typescript
const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
const [showOther, setShowOther] = useState(false);
const [showWithDescriptions, setShowWithDescriptions] = useState(false);
const [showDescriptionsDialog, setShowDescriptionsDialog] = useState(false);
const [isExpanded, setIsExpanded] = useState(false);
```

#### **Optimizaciones:**
- **useMemo**: Validación optimizada de opciones seleccionadas
- **Array Management**: Gestión eficiente de arrays de selección
- **Duplicate Prevention**: Prevención de duplicados en selecciones

---

### ⭐ **TYPE_03: Ranking de Estrellas (ResolveQuestionRankingEstrellas)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Star Rating System**: Sistema de calificación visual con estrellas
- **Dynamic Star Count**: Número de estrellas configurable
- **Visual Feedback**: Estados visuales para estrellas seleccionadas/no seleccionadas
- **Responsive Layout**: Adaptación a múltiples filas cuando es necesario

#### **Estados de Gestión:**
```typescript
const [rating, setRating] = useState<number>(0);
const maxStars = question.resolve.options?.length || 5;
```

#### **Características Técnicas:**
- **Icon-Based UI**: Uso de MaterialIcons para estrellas
- **Touch Handling**: Gestión de eventos táctiles para selección
- **State Synchronization**: Sincronización entre estado local y control

---

### 📁 **TYPE_04: Carga de Archivos (ResolveQuestionCargaArchivos)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  controlSize?: any;              // Control para tamaño de archivo
  controlExtension?: any;         // Control para extensión
  controlNameFile?: any;          // Control para nombre de archivo
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **File Picker Integration**: Integración con @react-native-documents/picker
- **Metadata Extraction**: Extracción automática de metadatos de archivos
- **File Type Detection**: Detección automática de tipos de archivo
- **Size Formatting**: Formateo inteligente de tamaños de archivo

#### **Estados de Gestión:**
```typescript
const [fileName, setFileName] = useState<string>('');
const [fileSize, setFileSize] = useState<number>(0);
const [fileType, setFileType] = useState<string>('');
const [_fileUri, setFileUri] = useState<string>('');
```

#### **Características Técnicas:**
- **Error Handling**: Manejo robusto de errores de selección de archivos
- **File Validation**: Validación de tipos y tamaños de archivo
- **Icon Mapping**: Mapeo de iconos según tipo de archivo
- **Size Calculation**: Cálculo y formateo de tamaños (B, KB, MB)

---

### 📝 **TYPE_05: Cuadro de Texto Simple (ResolveQuestionCuadroTextoSimple)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Text Input Integration**: Integración con React Native Paper TextInput
- **Keyboard Type Detection**: Detección automática del tipo de teclado
- **Validation Integration**: Integración con sistema de validación
- **Error State Management**: Gestión de estados de error

#### **Características Técnicas:**
- **Dynamic Keyboard**: Teclado numérico para campos numéricos
- **Error Display**: Visualización de errores de validación
- **Placeholder Management**: Gestión dinámica de placeholders
- **Value Synchronization**: Sincronización con control de formulario

---

### 💬 **TYPE_06: Cuadro de Comentario (ResolveQuestionCuadroComentario)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Multiline Text Input**: Campo de texto multilínea
- **Text Area Configuration**: Configuración específica para áreas de texto
- **Character Counting**: Conteo de caracteres/palabras
- **Scroll Management**: Gestión de scroll para textos largos

#### **Características Técnicas:**
- **Multiline Support**: Soporte para múltiples líneas de texto
- **Dynamic Height**: Altura dinámica según contenido
- **Scroll Integration**: Integración con sistema de scroll
- **Validation Support**: Soporte para validación de texto

---

### 🔢 **TYPE_07: Cantidad (ResolveQuestionCantidad)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Numeric Input System**: Sistema de entrada numérica
- **Interval Validation**: Validación basada en rangos predefinidos
- **Score Calculation**: Cálculo automático de puntajes
- **Range Display**: Visualización de rangos aplicables

#### **Estados de Gestión:**
```typescript
const [currentValue, setCurrentValue] = useState<string>('');
const [currentInterval, setCurrentInterval] = useState<IntervalScore | null>(null);
```

#### **Características Técnicas:**
- **Interval Matching**: Coincidencia automática con rangos
- **Score Assignment**: Asignación automática de puntajes
- **Real-time Validation**: Validación en tiempo real
- **Range Visualization**: Visualización de rangos aplicables

---

### 📅 **TYPE_08: Fecha y Hora (ResolveQuestionFechaHora)**

#### **Arquitectura Técnica:**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración de la pregunta
  control: any;                   // Control del formulario
  codigoItem?: any;               // Identificador del item
  readOnly?: boolean;             // Modo solo lectura
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

#### **Componentes Arquitectónicos:**
- **Date Picker Integration**: Integración con react-native-date-picker
- **DateTime Mode Support**: Soporte para fecha y fecha+hora
- **Interval Validation**: Validación basada en rangos de fechas
- **Localization Support**: Soporte para localización peruana

#### **Estados de Gestión:**
```typescript
const [date, setDate] = useState<Date | null>(null);
const [openPicker, setOpenPicker] = useState(false);
const [currentInterval, setCurrentInterval] = useState<IntervalScore | null>(null);
```

#### **Características Técnicas:**
- **Modal Date Picker**: Selector de fecha en modal
- **ISO String Handling**: Manejo de fechas en formato ISO
- **Day.js Integration**: Integración con Day.js para formateo
- **Interval Matching**: Coincidencia con rangos de fechas

---

## 🏗️ **Arquitectura de Componentes Compartidos**

### **DescriptionsDialog (Common Component)**

#### **Arquitectura Técnica:**
```typescript
interface DescriptionsDialogProps {
  visible: boolean;               // Estado de visibilidad
  options: Option[];              // Opciones a mostrar
  onClose: () => void;            // Callback de cierre
}
```

#### **Componentes Arquitectónicos:**
- **Modal System**: Sistema de modal nativo
- **Scrollable Content**: Contenido con scroll
- **Dynamic Rendering**: Renderizado dinámico de opciones
- **Touch Handling**: Gestión de eventos táctiles

#### **Características Técnicas:**
- **Overlay Management**: Gestión de overlay modal
- **Scroll Integration**: Integración con ScrollView
- **Conditional Rendering**: Renderizado condicional de descripciones
- **Accessibility Support**: Soporte para accesibilidad

---

## 🔄 **Patrones Arquitectónicos Comunes**

### **1. Props Interface Pattern**
```typescript
interface Props {
  question: QuestionConfig;        // Configuración centralizada
  control: any;                   // Control de formulario
  codigoItem?: any;               // Identificación
  readOnly?: boolean;             // Modo de operación
  onChangeValue?: (value: any) => void; // Callback de cambio
}
```

### **2. State Management Pattern**
```typescript
// Estados locales para UI
const [localState, setLocalState] = useState(initialValue);

// Sincronización con control externo
useEffect(() => {
  if (control.value !== undefined) {
    setLocalState(control.value);
  }
}, [control.value]);
```

### **3. Callback Pattern**
```typescript
const handleChange = (value: any) => {
  // Actualizar control
  control.onChange(value);
  
  // Notificar cambio externo
  if (onChangeValue) {
    onChangeValue({
      value,
      control,
      codigoItem
    });
  }
};
```

### **4. Conditional Rendering Pattern**
```typescript
{question.resolve.withInstructions && (
  <Text style={styles.instructions}>
    Nota: {question.resolve.instructions}
  </Text>
)}
```

---

## 🎨 **Arquitectura de Estilos**

### **Theme System**
```typescript
const APP_COLORS = {
  primary: '#bf0909',    // Rojo principal
  secondary: '#494949',  // Gris oscuro  
  accent: '#75a25d',     // Verde acento
  background: '#f5f5f5', // Gris claro de fondo
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
  info: '#17a2b8',
  warning: '#ffc107',
  error: '#dc3545',
};
```

### **Style Organization**
- **Container Styles**: Estilos de contenedor principal
- **Input Styles**: Estilos de campos de entrada
- **Button Styles**: Estilos de botones interactivos
- **State Styles**: Estilos para diferentes estados (normal, error, disabled)

---

## 🔧 **Optimizaciones de Rendimiento**

### **1. Memoización**
```typescript
const handleChange = useCallback((value: any) => {
  // Lógica de cambio
}, [dependencies]);
```

### **2. Conditional Rendering**
```typescript
{condition && <Component />}
```

### **3. State Optimization**
```typescript
const validSelectedOptions = useMemo(() => {
  // Lógica de validación
}, [control.value]);
```

### **4. Event Handler Optimization**
```typescript
const handlePress = useCallback(() => {
  // Lógica de manejo
}, [dependencies]);
```

---

## 🔌 **Integración con Sistema de Formularios**

### **Form Control Integration**
```typescript
// Actualización de control
control.onChange(value);

// Validación de estado
control.touched && !control.valid

// Estado de habilitación
readOnly || !control.enabled
```

### **Validation Integration**
```typescript
// Error display
error={control.touched && !control.valid}

// Error styling
style={[styles.input, control.touched && !control.valid && styles.errorInput]}
```

---

## 📱 **Responsive Design**

### **Adaptive Layout**
- **Flexbox**: Layout flexible y adaptable
- **Percentage-based**: Dimensiones basadas en porcentajes
- **Platform-specific**: Adaptaciones específicas por plataforma
- **Orientation Support**: Soporte para diferentes orientaciones

### **Touch Optimization**
- **TouchableOpacity**: Componentes táctiles optimizados
- **Minimum Touch Area**: Áreas mínimas de toque (44px)
- **Visual Feedback**: Retroalimentación visual en interacciones

---

*Esta arquitectura técnica proporciona una base sólida y escalable para la plataforma SIMON, permitiendo el desarrollo eficiente de componentes de monitoreo educativo con alta calidad y mantenibilidad.* 