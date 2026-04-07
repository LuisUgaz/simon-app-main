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
 * Componente para preguntas de cuadro de comentario (textarea)
 */
export const ResolveQuestionCuadroComentario: React.FC<Props> = ({
  question,
  control,
  codigoItem,
  readOnly = true,
  onChangeValue
}) => {
  // Manejar cambio en el valor del textarea
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

      {/* Campo de texto multilinea */}
      <TextInput
        value={control.value || ''}
        onChangeText={handleInputChange}
        placeholder="Ingresa tu comentario aquí..."
        mode="outlined"
        multiline
        numberOfLines={5}
        maxLength={1000}
        disabled={readOnly || !control.enabled}
        style={styles.input}
        error={control.touched && !control.valid}
      />
      <Text style={styles.counter}>
        {(control.value || '').length} / 1000
      </Text>
    </View>
  );
}; 