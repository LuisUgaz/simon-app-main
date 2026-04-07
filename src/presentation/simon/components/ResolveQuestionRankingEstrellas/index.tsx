import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
 * Componente para preguntas de ranking con estrellas
 */
export const ResolveQuestionRankingEstrellas: React.FC<Props> = ({
  question,
  control,
  codigoItem,
  readOnly = true,
  onChangeValue
}) => {
  // Estados
  const [rating, setRating] = useState<number>(0);
  
  // Obtener el valor máximo de estrellas (número de opciones)
  const maxStars = question.resolve.options?.length || 5;
  
  // Inicializar el rating cuando cambia el control
  useEffect(() => {
    if (control.value !== undefined) {
      const value = Number(control.value);
      setRating(isNaN(value) ? 0 : value);
    }
  }, [control.value]);
  
  // Manejar cambio en el rating
  const handleRatingChange = (value: number) => {
    // Actualizar estado local
    setRating(value);
    console.log('ranking estrellas control', question.resolve.options[value - 1]);
    // Actualizar control
    control.onChange(question.resolve.options[value - 1].code);
    
    // Notificar cambio si se proporcionó callback
    if (onChangeValue) {
      onChangeValue({
        value: value.toString(),
        control,
        codigoItem
      });
    }
  };
  
  // Renderizar estrellas
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.star}
          onPress={() => !readOnly && control.enabled && handleRatingChange(i)}
          disabled={readOnly || !control.enabled}
        >
          <Icon
            name={i <= rating ? 'star' : 'star-border'} 
            size={30}
            color={i <= rating ? '#FFC107' : '#C5C5C5'}
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };
  
  return (
    <View style={styles.container}>
      {/* Instrucciones */}
      {question.resolve.withInstructions && (
        <Text style={styles.instructions}>
          Nota: {question.resolve.instructions}
        </Text>
      )}
      
      {/* Estrellas - Responsive: se adapta a múltiples filas cuando hay muchas estrellas */}
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      
      {/* Texto de puntuación */}
      {rating > 0 && (
        <Text style={styles.ratingText}>
          Puntuación: {rating} de {maxStars}
        </Text>
      )}
    </View>
  );
}; 