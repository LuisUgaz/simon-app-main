import React from 'react';
import { View, ScrollView, StyleSheet, Button, Text } from 'react-native';
import { useForm } from 'react-hook-form';

// Importar componentes del módulo Simon
import { ResolveQuestionConfigurationForm } from '../components/ResolveQuestionConfigurationForm';
import { useFormControl } from '../hooks/useFormControl';
import { configs } from '../services/config';
import { QuestionConfig } from '../interfaces/question-config';

// Definir interfaz para el tipo de datos del formulario
interface FormData {
  [key: string]: string | string[];
}

// Componente para renderizar una pregunta individual
const QuestionFormItem: React.FC<{
  question: QuestionConfig;
  index: number;
  control: any;
}> = ({ question, index, control }) => {
  // Crear control para la pregunta principal
  const questionControl = useFormControl(
    `question_${question.resolve.order || index}`,
    control,
    { required: true },
    ''
  );
  
  // Control para opción "Otro" - siempre se crea, pero solo se usa si es necesario
  const otherControl = useFormControl(
    `question_${question.resolve.order || index}_other`,
    control,
    {},
    ''
  );
  
  // Controles específicos para carga de archivos - siempre se crean, pero solo se usan para TYPE_04
  const sizeControl = useFormControl(
    `question_${question.resolve.order || index}_size`,
    control,
    {},
    ''
  );
  
  const extensionControl = useFormControl(
    `question_${question.resolve.order || index}_extension`,
    control,
    {},
    ''
  );
  
  const nameFileControl = useFormControl(
    `question_${question.resolve.order || index}_filename`,
    control,
    {},
    ''
  );
  
  // Determinar qué controles pasar según el tipo de pregunta
  const actualOtherControl = question.resolve.withOtherOption ? otherControl : undefined;
  const actualSizeControl = question.type === 'TYPE_04' ? sizeControl : undefined;
  const actualExtensionControl = question.type === 'TYPE_04' ? extensionControl : undefined;
  const actualNameFileControl = question.type === 'TYPE_04' ? nameFileControl : undefined;
  
  return (
    <View style={styles.questionContainer}>
      <ResolveQuestionConfigurationForm
        number={index + 1}
        question={question}
        control={questionControl}
        controlOther={actualOtherControl}
        controlSize={actualSizeControl}
        controlExtension={actualExtensionControl}
        controlNameFile={actualNameFileControl}
        readOnly={false}
        onChangeValue={(value) => console.log('Valor cambiado:', value)}
      />
    </View>
  );
};

// Componente de ejemplo para demostrar el uso de Simon
export const SimonFormExample: React.FC = () => {
  // Usar React Hook Form para gestionar el formulario
  const { control, handleSubmit } = useForm<FormData>();
  
  // Obtener configuraciones de preguntas (normalmente vendría de una API)
  const formQuestions: QuestionConfig[] = configs;
  
  // Manejar envío del formulario
  const onSubmit = (data: FormData) => {
    console.log('Datos del formulario:', data);
    // Aquí enviarías los datos al backend
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ejemplo de Formulario Simon</Text>
      
      <ScrollView style={styles.formContainer}>
        {formQuestions.map((question, index) => (
          <QuestionFormItem
            key={question.type + index}
            question={question}
            index={index}
            control={control}
          />
        ))}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Enviar Formulario"
          onPress={handleSubmit(onSubmit)}
          color="#6200ee"
        />
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#6200ee',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
}); 