import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
 * Componente para preguntas de casillas de verificación (multiple selección)
 */
export const ResolveQuestionCasillaVerificacion: React.FC<Props> = ({
  question,
  control,
  controlOther,
  codigoItem,
  readOnly = true,
  onChangeValue
}) => {
  // Estados
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showOther, setShowOther] = useState(false);
  const [showWithDescriptions, setShowWithDescriptions] = useState(false);
  const [showDescriptionsDialog, setShowDescriptionsDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Inicializar selecciones cuando cambia el control - OPTIMIZADO para evitar re-renders innecesarios
  const validSelectedOptions = useMemo(() => {
    if (control.value === undefined || control.value === null) {
      return [];
    }
    
    if (Array.isArray(control.value)) {
      return control.value.filter((v: any) => v !== '' && v !== null && v !== undefined);
    }
    
    return (control.value !== '' && control.value !== null) ? [control.value] : [];
  }, [control.value]);

  useEffect(() => {
    setSelectedOptions(validSelectedOptions);
    setShowOther(validSelectedOptions.includes('OTHER'));
  }, [validSelectedOptions]);
  
  // Comprobar si hay descripciones
  useEffect(() => {
    if (question?.resolve?.options) {
      const hasDescriptions = question.resolve.options.some(
        (option: Option) => option.withDescription
      );
      setShowWithDescriptions(hasDescriptions);
    }
  }, [question]);
  
  // Manejar cambio de selección de checkbox - MEMOIZADO para evitar re-renders
  const handleCheckboxPress = useCallback((optionCode: string) => {
    if (readOnly || !control.enabled || !optionCode || optionCode.trim() === '') return;
    
    let newSelected: string[];
    
    if (selectedOptions.includes(optionCode)) {
      // Deseleccionar si ya está seleccionado
      newSelected = selectedOptions.filter(code => code !== optionCode);
    } else {
      // Seleccionar si no está seleccionado - evitar duplicados
      newSelected = [...selectedOptions.filter(code => code !== optionCode), optionCode];
    }
    
    // Filtrar valores inválidos del array final
    newSelected = newSelected.filter(code => 
      code !== '' && code !== null && code !== undefined
    );
    
    setSelectedOptions(newSelected);
    control.onChange(newSelected);
    
    // Verificar si la opción "Otro" está seleccionada
    const isOtherSelected = newSelected.includes('OTHER');
    setShowOther(isOtherSelected);
    
    if (!isOtherSelected && controlOther) {
      controlOther.onChange('');
    }
    
    if (onChangeValue) {
      onChangeValue({
        value: newSelected,
        control,
        codigoItem
      });
    }
  }, [readOnly, control, selectedOptions, controlOther, onChangeValue, codigoItem]);

  // Toggle del dropdown - MEMOIZADO
  const toggleDropdown = useCallback(() => {
    if (!readOnly && control.enabled) {
      setIsExpanded(!isExpanded);
    }
  }, [readOnly, control.enabled, isExpanded]);

  // Obtener el texto de las opciones seleccionadas - MEMOIZADO
  const getSelectedOptionsText = useCallback(() => {
    // Filtrar opciones válidas (no vacías, no null, no undefined)
    const validOptions = selectedOptions.filter(option => 
      option !== '' && option !== null && option !== undefined
    );
    
    if (validOptions.length === 0) {
      return "Selecciona una o más opciones...";
    }
    
    const selectedTitles = validOptions.map(code => {
      if (code === 'OTHER') return "Otro(s)";
      const option = question.resolve.options.find(opt => opt.code === code);
      return option?.title || code;
    }).filter(title => title && title.trim() !== ''); // Filtrar títulos vacíos
    
    if (selectedTitles.length === 1) {
      return selectedTitles[0];
    } else if (selectedTitles.length <= 2) {
      return selectedTitles.join(', ');
    } else {
      return `${selectedTitles.length} opciones seleccionadas`;
    }
  }, [selectedOptions, question.resolve.options]);
  
  // Abrir diálogo de descripciones - MEMOIZADO
  const openDescriptionsDialog = useCallback(() => {
    setShowDescriptionsDialog(true);
  }, []);
  
  // Cerrar diálogo de descripciones - MEMOIZADO
  const closeDescriptionsDialog = useCallback(() => {
    setShowDescriptionsDialog(false);
  }, []);

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
          <Icon name="comment-text-outline" size={20} color="#6200ee" />
          <Text style={styles.descriptionsText}>
            Descripciones de las alternativas
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Dropdown personalizado para checkboxes */}
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
            selectedOptions.length === 0 && styles.dropdownPlaceholder,
            (readOnly || !control.enabled) && styles.dropdownHeaderTextDisabled
          ]}>
            {getSelectedOptionsText()}
          </Text>
          <Icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={readOnly || !control.enabled ? "#6c757d" : "#bf0909"} 
          />
        </TouchableOpacity>

        {/* Opciones expandidas con checkboxes */}
        {isExpanded && (
          <View style={styles.dropdownOptions}>
            {question.resolve.options.map((option, index) => (
              <TouchableOpacity
                key={option.code || index}
                style={[
                  styles.dropdownOption,
                  index === question.resolve.options.length - 1 && !question.resolve.withOtherOption && styles.dropdownOptionLast
                ]}
                onPress={() => handleCheckboxPress(option.code || '')}
              >
                <View style={[
                  styles.checkbox,
                  selectedOptions.includes(option.code || '') && styles.checkboxSelected
                ]}>
                  {selectedOptions.includes(option.code || '') && (
                    <Icon name="check" size={16} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Opción "Otro" si está habilitada */}
            {question.resolve.withOtherOption && (
              <TouchableOpacity
                style={[styles.dropdownOption, styles.dropdownOptionLast]}
                onPress={() => handleCheckboxPress('OTHER')}
              >
                <View style={[
                  styles.checkbox,
                  selectedOptions.includes('OTHER') && styles.checkboxSelected
                ]}>
                  {selectedOptions.includes('OTHER') && (
                    <Icon name="check" size={16} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  Otro(s)
                </Text>
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
              value={controlOther.value || ''}
              onChangeText={text => controlOther.onChange(text)}
              placeholder="Ingresa aquí otro..."
              disabled={readOnly || !control.enabled}
              style={styles.otherInput}
            />
          )}
          
          {question.resolve.formatOtherOption === 'NUMBER' && (
            <TextInput
              value={controlOther.value?.toString() || ''}
              onChangeText={text => controlOther.onChange(text)}
              placeholder="Ingresar respuesta..."
              keyboardType="numeric"
              disabled={readOnly || !control.enabled}
              style={styles.otherInput}
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