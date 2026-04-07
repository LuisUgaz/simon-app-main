import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { QuestionConfig } from '../../interfaces/question-config';
import { Option } from '../../interfaces/option';

// Diálogo para descripciones
import { DescriptionsDialog } from '../common/DescriptionsDialog';

// Estilos
import { styles } from './styles';

interface Props {
  question: QuestionConfig;
  control: any;
  controlOther?: any;
  codigoItem?: any;
  readOnly?: boolean;
  onChangeValue?: (value: any) => void;
}

/**
 * Componente para responder preguntas de opción múltiple
 */
export const ResolveQuestionOpcionMultiple: React.FC<Props> = ({
  question,
  control,
  controlOther,
  codigoItem,
  readOnly = true,
  onChangeValue
}) => {
  // Estados
  const [showOther, setShowOther] = useState(false);
  const [showWithDescriptions, setShowWithDescriptions] = useState(false);
  const [showDescriptionsDialog, setShowDescriptionsDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ref para evitar dependencias circulares en useEffect
  const controlOtherRef = useRef(controlOther);
  controlOtherRef.current = controlOther;

  // Comprobar si hay descripciones
  useEffect(() => {
    if (question?.resolve?.options) {
      const hasDescriptions = question.resolve.options.some(
        (option: Option) => option.withDescription
      );
      setShowWithDescriptions(hasDescriptions);
    }
  }, [question]);

  // Manejar cambios en el valor - CORREGIDO: usando useRef para evitar bucle infinito
  useEffect(() => {
    const value = control.value;
    const isOther = value === 'OTHER';
    setShowOther(isOther);

    // Se eliminó la limpieza automática para permitir cargar valores guardados
    // if (isOther && controlOtherRef.current && !showOther) {
    //   controlOtherRef.current.onChange('');
    // }
  }, [control.value, showOther]); // CORREGIDO: usando useRef para evitar dependencia de controlOther

  // Manejar cambio de selección - MEMOIZADO
  const handleValueChange = useCallback((selectedValue: any) => {
    // Convertir el valor seleccionado a string para mantener compatibilidad
    const value = String(selectedValue);
    console.log('🔄 ResolveQuestionOpcionMultiple - value:', value);
    control.onChange(value);

    if (onChangeValue) {
      onChangeValue({
        value,
        control,
        codigoItem
      });
    }
  }, [control, onChangeValue, codigoItem]);

  // Manejar selección de radio button - MEMOIZADO
  const handleRadioPress = useCallback((optionCode: string) => {
    if (!readOnly && control.enabled) {
      handleValueChange(optionCode);
      setIsExpanded(false); // Colapsar después de seleccionar
    }
  }, [readOnly, control.enabled, handleValueChange]);

  // Toggle del dropdown - MEMOIZADO
  const toggleDropdown = useCallback(() => {
    if (!readOnly && control.enabled) {
      setIsExpanded(!isExpanded);
    }
  }, [readOnly, control.enabled, isExpanded]);

  // Obtener el texto de la opción seleccionada - MEMOIZADO
  const getSelectedOptionText = useCallback(() => {
    if (!control.value) return "Selecciona una opción...";

    if (control.value === 'OTHER') return "Otro(s)";

    const selectedOption = question.resolve.options.find(
      option => option.code === control.value
    );
    return selectedOption?.title || "Selecciona una opción...";
  }, [control, question.resolve.options]);

  // Abrir diálogo de descripciones - MEMOIZADO
  const openDescriptionsDialog = useCallback(() => {
    setShowDescriptionsDialog(true);
  }, []);

  // Cerrar diálogo de descripciones - MEMOIZADO
  const closeDescriptionsDialog = useCallback(() => {
    setShowDescriptionsDialog(false);
  }, []);

  // Estado local para el valor del campo "Otro" para evitar problemas de sincronización
  const [otherValue, setOtherValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar estado local con controlOther
  useEffect(() => {
    // Solo sincronizar si el input no tiene el foco para evitar conflicto de ediciones
    if (!isFocused) {
      if (controlOther?.value !== undefined && controlOther?.value !== null) {
        setOtherValue(controlOther.value.toString());
      } else {
        setOtherValue('');
      }
    }
  }, [controlOther?.value, isFocused]);

  // Manejador para cambiar el valor
  const handleOtherChange = (text: string) => {
    setOtherValue(text);
    if (controlOther) {
      controlOther.onChange(text);
    }
  };

  const handleFocus = () => setIsFocused(true);

  const handleBlur = () => {
    setIsFocused(false);
    if (controlOther?.onBlur) {
      controlOther.onBlur();
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
      {/* Botón para mostrar descripciones */}
      {showWithDescriptions && (
        <TouchableOpacity
          style={styles.descriptionsButton}
          onPress={openDescriptionsDialog}
        >
          <Icon name="comment-text-outline" size={18} color="#bf0909" />
          <Text style={styles.descriptionsText}>
            Descripciones de las alternativas
          </Text>
        </TouchableOpacity>
      )}

      {/* Dropdown personalizado */}
      <View style={styles.dropdownContainer}>
        {/* Header del dropdown */}
        <TouchableOpacity
          style={[
            styles.dropdownHeader,
            isExpanded && styles.dropdownHeaderExpanded,
            (readOnly || !control.enabled) && styles.dropdownHeaderDisabled
          ]}
          onPress={toggleDropdown}
          disabled={readOnly || !control.enabled}
        >
          <Text style={[
            styles.dropdownHeaderText,
            !control.value && styles.dropdownPlaceholder,
            (readOnly || !control.enabled) && styles.dropdownHeaderTextDisabled
          ]}>
            {getSelectedOptionText()}
          </Text>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={readOnly || !control.enabled ? "#6c757d" : "#bf0909"}
          />
        </TouchableOpacity>

        {/* Opciones expandidas */}
        {isExpanded && (
          <View style={styles.dropdownOptions}>
            {question.resolve.options.map((option, index) => (
              <TouchableOpacity
                key={option.code || index}
                style={[
                  styles.dropdownOption,
                  index === question.resolve.options.length - 1 && !question.resolve.withOtherOption && styles.dropdownOptionLast
                ]}
                onPress={() => handleRadioPress(option.code || '')}
              >
                <View style={styles.radioButton}>
                  <View style={[
                    styles.radioCircle,
                    control.value === (option.code || '') && styles.radioCircleSelected
                  ]}>
                    {control.value === (option.code || '') && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>
                    {option.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Opción "Otro" si está habilitada */}
            {question.resolve.withOtherOption && (
              <TouchableOpacity
                style={[styles.dropdownOption, styles.dropdownOptionLast]}
                onPress={() => handleRadioPress('OTHER')}
              >
                <View style={styles.radioButton}>
                  <View style={[
                    styles.radioCircle,
                    control.value === 'OTHER' && styles.radioCircleSelected
                  ]}>
                    {control.value === 'OTHER' && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>
                    Otro(s)
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Campo para "Otro" */}
      {showOther && controlOther && (
        <View style={styles.otherContainer}>
          {question.resolve.formatOtherOption === 'TEXT' && (
            <TextInput
              value={otherValue}
              onChangeText={handleOtherChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Ingresa aquí otro... *"
              disabled={readOnly || !control.enabled}
              style={styles.otherInput}
              error={controlOther.touched && !controlOther.value}
            />
          )}

          {question.resolve.formatOtherOption === 'NUMBER' && (
            <TextInput
              value={otherValue}
              onChangeText={handleOtherChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Ingresar respuesta... *"
              keyboardType="numeric"
              disabled={readOnly || !control.enabled}
              style={styles.otherInput}
              error={controlOther.touched && !controlOther.value}
            />
          )}

          {/* Implementar otros formatos según sea necesario */}
        </View>
      )}

      {/* Diálogo de descripciones */}
      <DescriptionsDialog
        visible={showDescriptionsDialog}
        options={question.resolve.options}
        onClose={closeDescriptionsDialog}
      />
    </View>
  );
}; 