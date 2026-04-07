# simon-app

Aplicación para formularios Simon en React Native.

## Dependencias principales

- React Native
- React Hook Form (para formularios)
- React Native Paper (componentes UI)
- React Native Navigation (navegación)
- @react-native-documents/picker (para selección de archivos)
- react-native-date-picker (para selección de fechas)
- react-native-input-select (para componentes desplegables)

## Instalación

```bash
npm install
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

```bash
npx react-native run-android
```

## Estructura del proyecto

- `/src/presentation/simon`: Contiene todos los componentes migrados desde Angular
  - `/components`: Componentes ResolveQuestion migrados
  - `/interfaces`: Interfaces para tipado
  - `/services`: Servicios y configuraciones
  - `/hooks`: Hooks personalizados
  - `/utils`: Utilidades
  - `/examples`: Ejemplos de implementación

## Componentes implementados

Se han migrado los siguientes componentes desde Angular:

1. ResolveQuestionOpcionMultiple (opciones múltiples)
2. ResolveQuestionCasillaVerificacion (casillas de verificación)
3. ResolveQuestionRankingEstrellas (ranking con estrellas)
4. ResolveQuestionCuadroTextoSimple (texto simple)
5. ResolveQuestionCuadroComentario (área de texto)
6. ResolveQuestionCantidad (valores numéricos)
7. ResolveQuestionFechaHora (fecha/hora)
8. ResolveQuestionCargaArchivos (carga de archivos)

## Notas de versión

- Se ha sustituido expo-document-picker por @react-native-documents/picker para la funcionalidad de selección de archivos.
- Se ha corregido el manejo de errores en el componente ResolveQuestionCargaArchivos para detectar correctamente cuando el usuario cancela la selección.
- Se utiliza react-native-date-picker en lugar de @react-native-community/datetimepicker para mejor experiencia de usuario.
- Se implementa react-native-input-select para componentes desplegables.