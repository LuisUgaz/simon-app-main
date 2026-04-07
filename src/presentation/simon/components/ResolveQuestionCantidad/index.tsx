import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { QuestionConfig } from '../../interfaces/question-config';
import { IntervalScore } from '../../interfaces/interval-score';

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
 * Componente para preguntas de cantidad numérica
 */
export const ResolveQuestionCantidad: React.FC<Props> = ({
  question,
  control,
  codigoItem,
  readOnly = true,
  onChangeValue
}) => {
  // Estados
  const [currentValue, setCurrentValue] = useState<string>('');
  const [currentInterval, setCurrentInterval] = useState<IntervalScore | null>(null);

  // Calcular minDate y maxDate
  // Se mueve al inicio para usarlo en handleInputChange
  let minValue: number | undefined;
  let maxValue: number | undefined;
  console.log('datos de cantidad', question.resolve)
  if (question.resolve.withScore && question.resolve.options && question.resolve.options.length > 0) {
    const firstOption = question.resolve.options[0];
    const lastOption = question.resolve.options[question.resolve.options.length - 1];

    if (firstOption.scoreMin) {
      minValue = Number(firstOption.scoreMin);
    }

    if (lastOption.scoreMax) {
      maxValue = Number(lastOption.scoreMax);
    }
  }

  // Inicializar cuando cambia el control
  useEffect(() => {
    if (control.value !== undefined) {
      setCurrentValue(control.value.toString());
    }
  }, [control.value]);

  // Manejar cambio en el valor
  const handleInputChange = (text: string) => {
    // Validar limites si es con puntaje
    if (question.resolve.withScore) {
      // Si está vacio permitir borrar
      if (text === '') {
        setCurrentValue(text);
        control.onChange(text);
        if (onChangeValue) {
          onChangeValue({
            value: text,
            control,
            codigoItem
          });
        }
        return;
      }

      const numericValue = Number(text);

      // Validar si es número válido
      if (isNaN(numericValue)) {
        return;
      }

      // Validar máximo
      if (maxValue !== undefined && numericValue >= maxValue) {
        return;
      }

      // Validar mínimo (solo si la longitud del texto es suficiente para evitar bloquear escritura parcial)
      // Por ejemplo si min es 10 y escribo 1, no bloquear. Pero si min es 5 y escribo 0, bloquear si 0 no es inicio de nada valido?
      // Estrategia segura: Solo bloquear máximo durante escritura para no afectar UX
    }

    setCurrentValue(text);

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

      {/* Campo numérico */}
      <TextInput
        value={currentValue}
        onChangeText={handleInputChange}
        placeholder="Ingresa un valor numérico..."
        mode="outlined"
        keyboardType="numeric"
        disabled={readOnly || !control.enabled}
        style={styles.input}
        error={control.touched && !control.valid}
      />

      {/* Información del intervalo */}
      {question.resolve.withScore && (
        <View style={styles.intervalInfo}>
          <Text style={styles.intervalText}>
            Valor debe estar entre {minValue} y {maxValue}
          </Text>
        </View>
      )}
    </View>
  );
}; 