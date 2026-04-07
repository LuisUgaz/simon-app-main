import React from 'react';
import { View, Text } from 'react-native';
import { QuestionConfig } from '../../interfaces/question-config';

// Importar componentes específicos
import { ResolveQuestionOpcionMultiple } from '../ResolveQuestionOpcionMultiple';
import { ResolveQuestionCasillaVerificacion } from '../ResolveQuestionCasillaVerificacion';
import { ResolveQuestionRankingEstrellas } from '../ResolveQuestionRankingEstrellas';
import { ResolveQuestionCargaArchivos } from '../ResolveQuestionCargaArchivos';
import { ResolveQuestionCuadroTextoSimple } from '../ResolveQuestionCuadroTextoSimple';
import { ResolveQuestionCuadroComentario } from '../ResolveQuestionCuadroComentario';
import { ResolveQuestionCantidad } from '../ResolveQuestionCantidad';
import { ResolveQuestionFechaHora } from '../ResolveQuestionFechaHora';

// Importar estilos
import { styles } from './styles';

// Definir interfaz de propiedades
interface Props {
  number: number;
  question: QuestionConfig;
  codigoItem?: any;
  idItem?: string;
  readOnly?: boolean;
  control: any; // React Hook Form control u otro sistema
  controlOther?: any;
  controlSize?: any;
  controlExtension?: any;
  controlNameFile?: any;
  onChangeValue?: (value: any) => void;
}

/**
 * Componente principal que renderiza el tipo de pregunta adecuado según la configuración
 */
export const ResolveQuestionConfigurationForm: React.FC<Props> = ({
  number: _number,
  question,
  idItem,
  codigoItem,
  readOnly = true,
  control,
  controlOther,
  controlSize,
  controlExtension,
  controlNameFile,
  onChangeValue
}) => {
  // Manejar cambio de valor
  const handleChange = (value: any) => {
    if (onChangeValue) {
      onChangeValue(value);
    }
  };

  // Determinar estilos del contenedor según estado
  const getContainerStyle = () => {
    const isInvalid = control.touched && !control.valid && control.enabled;
    const isDisabled = !control.enabled;
    const hasValue = control.value && control.value !== '';
    
    if (isDisabled) {
      return [styles.container, styles.disabledContainer];
    } else if (isInvalid) {
      return [styles.container, styles.errorContainer];
    } else if (hasValue && control.enabled) {
      return [styles.container, styles.validContainer];
    }
    
    return styles.container;
  };

  // Renderizar el componente correcto según el tipo
  const renderQuestion = () => {
    switch (question?.type) {
      case 'TYPE_01': // Opción múltiple
        return (
          <ResolveQuestionOpcionMultiple
            question={question}
            controlOther={controlOther}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      case 'TYPE_02': // Casillas de verificación
        return (
          <ResolveQuestionCasillaVerificacion
            question={question}
            controlOther={controlOther}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
      
      case 'TYPE_03': // Ranking de estrellas
        return (
          <ResolveQuestionRankingEstrellas
            question={question}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      case 'TYPE_04': // Carga de archivos
        return (
          <ResolveQuestionCargaArchivos
            question={question}
            idItem={idItem}
            codigoItem={codigoItem}
            control={control}
            controlSize={controlSize}
            controlExtension={controlExtension}
            controlNameFile={controlNameFile}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      case 'TYPE_05': // Cuadro de texto simple
        return (
          <ResolveQuestionCuadroTextoSimple
            question={question}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      case 'TYPE_06': // Cuadro de comentario
        return (
          <ResolveQuestionCuadroComentario
            question={question}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      case 'TYPE_07': // Cantidad
        return (
          <ResolveQuestionCantidad
            question={question}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      case 'TYPE_08': // Fecha y hora
        return (
          <ResolveQuestionFechaHora
            question={question}
            codigoItem={codigoItem}
            control={control}
            readOnly={readOnly}
            onChangeValue={handleChange}
          />
        );
        
      default:
        return <Text>Tipo de pregunta no soportado: {question?.type}</Text>;
    }
  };

  if (!question) {
    return null;
  }

  return (
    <View style={getContainerStyle()}>
      {renderQuestion()}
    </View>
  );
}; 