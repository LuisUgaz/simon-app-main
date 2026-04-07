import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Nota: Este componente usa react-native-date-picker en lugar de @react-native-community/datetimepicker
// npm install react-native-date-picker --save
import DatePicker from 'react-native-date-picker';
import { QuestionConfig } from '../../interfaces/question-config';
import { IntervalScore } from '../../interfaces/interval-score';
import dayjs from 'dayjs';

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
 * Componente para preguntas de fecha y hora
 */
export const ResolveQuestionFechaHora: React.FC<Props> = ({
  question,
  control,
  codigoItem,
  readOnly = true,
  onChangeValue,
}) => {


  // Estados
  const [date, setDate] = useState<Date | null>(null);
  const [openPicker, setOpenPicker] = useState(false);
  const [currentInterval, setCurrentInterval] = useState<IntervalScore | null>(
    null,
  );

  // Determinar si solo es fecha o también incluye hora
  const isDateTimeMode = question.resolve.typeOption === 'DATETIME';

  // Formatear fecha para mostrar
  const formatDate = (date: Date | null): string => {
    if (!date) return '';

    if (isDateTimeMode) {
      return dayjs(date).format('DD/MM/YYYY HH:mm');
    } else {
      return dayjs(date).format('DD/MM/YYYY');
    }
  };

  // Inicializar cuando cambia el control
  useEffect(() => {
    if (control.value) {
      try {
        const selectedDate = new Date(control.value);
        setDate(selectedDate);
      } catch (error) {
        console.error('Error al convertir la fecha:', error);
      }
    }
  }, [control.value]);

  // Abrir el selector de fecha
  const openDatePicker = () => {
    if (!readOnly && control.enabled) {
      setOpenPicker(true);
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
    setOpenPicker(false);

    // Actualizar control
    control.onChange(selectedDate.toISOString());

    // Notificar cambio si se proporcionó callback
    if (onChangeValue) {
      onChangeValue({
        value: selectedDate.toISOString(),
        control,
        codigoItem,
      });
    }
  };

  // Calcular minDate y maxDate
  let minDate: Date | undefined;
  let maxDate: Date | undefined;

  if (question.resolve.withScore && question.resolve.options && question.resolve.options.length > 0) {
    const firstOption = question.resolve.options[0];
    const lastOption = question.resolve.options[question.resolve.options.length - 1];

    if (firstOption.scoreMin) {
      minDate = new Date(firstOption.scoreMin);
    }

    if (lastOption.scoreMax) {
      maxDate = new Date(lastOption.scoreMax);
    }
  }

  return (
    <View style={styles.container}>
      {/* Instrucciones */}
      {question.resolve.withInstructions && (
        <Text style={styles.instructions}>
          Nota: {question.resolve.instructions}
        </Text>
      )}

      {/* Selector de fecha */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={openDatePicker}
        disabled={readOnly || !control.enabled}>
        <Icon
          name={isDateTimeMode ? 'calendar-clock' : 'calendar'}
          size={24}
          color="#6200ee"
        />
        <Text style={[styles.dateText, !date && styles.placeholderText]}>
          {date
            ? formatDate(date)
            : isDateTimeMode
              ? 'Seleccionar fecha y hora'
              : 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>

      {/* Picker de fecha (modal) */}
      <DatePicker
        modal
        confirmText="Confirmar"
        cancelText="Cancelar"
        title={isDateTimeMode ? 'Selecciona' : 'Selecciona una fecha'}
        open={openPicker}
        date={date || new Date()}
        mode={isDateTimeMode ? 'datetime' : 'date'}
        minimumDate={minDate}
        maximumDate={maxDate}
        onConfirm={handleDateChange}
        onCancel={() => setOpenPicker(false)}
        is24hourSource="locale"
      />

      {/* Información del intervalo */}
      {question.resolve.withScore && (
        <View style={styles.intervalInfo}>
          <Text style={styles.intervalText}>
            Valor debe estar entre {dayjs(minDate).format('DD/MM/YYYY')} y {dayjs(maxDate).format('DD/MM/YYYY')}
          </Text>
        </View>
      )}
    </View>
  );
};
