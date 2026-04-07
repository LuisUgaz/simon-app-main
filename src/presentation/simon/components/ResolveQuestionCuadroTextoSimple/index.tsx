import React from 'react';
import { View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { QuestionConfig } from '../../interfaces/question-config';

// Estilos
import { styles } from './styles';

interface Props {
  question: QuestionConfig;
  control: any;
  codigoItem?: any;
  readOnly?: boolean;
  onChangeValue?: (value: any) => void;
}

/**
 * Componente para preguntas de cuadro de texto simple
 */
export const ResolveQuestionCuadroTextoSimple: React.FC<Props> = ({
  question,
  control,
  codigoItem,
  readOnly = true,
  onChangeValue
}) => {
  // Manejar cambio en el valor del input
  const handleInputChange = (text: string) => {
    // Actualizar control
    control.onChange(text);

    // Notificar cambio si se proporcionó callback
    if (onChangeValue) {
      onChangeValue({
        value: text,
        control,
        codigoItem
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Instrucciones */}
      {question.resolve.withInstructions && (
        <Text style={styles.instructions}>
          Nota: {question.resolve.instructions}
        </Text>
      )}

      {/* Campo de texto */}
      <TextInput
        value={control.value || ''}
        onChangeText={handleInputChange}
        placeholder="Ingresa tu respuesta aquí..."
        mode="outlined"
        disabled={readOnly || !control.enabled}
        style={styles.input}
        error={control.touched && !control.valid}
        // Aplicar tipo de teclado según el tipo de opción
        keyboardType={question.resolve.typeOption === 'NUMBER' ? 'numeric' : 'default'}
        maxLength={300}
      />
      <Text style={styles.counter}>
        {(control.value || '').length} / 300
      </Text>
    </View>
  );
}; 