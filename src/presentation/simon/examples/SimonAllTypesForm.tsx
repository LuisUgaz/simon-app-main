import React from 'react';
import { View, ScrollView, StyleSheet, Button, Text, Alert } from 'react-native';
import { useForm } from 'react-hook-form';

// Importar componentes del módulo Simon
import { ResolveQuestionConfigurationForm } from '../components/ResolveQuestionConfigurationForm';
import { useFormControl } from '../hooks/useFormControl';
import { QuestionConfig } from '../interfaces/question-config';

// Definir interfaz para el tipo de datos del formulario
interface FormData {
  [key: string]: string | string[] | number | Date;
}

// Datos completos del formulario con todos los tipos de preguntas
const allTypesQuestionData = [
  {
    "id": "demo_type_01",
    "codigo": "DEMO-TYPE-01",
    "titulo": "¿Cuál es su nivel de experiencia con tecnología educativa?",
    "orden": 1,
    "configuracion": {
      "type": "TYPE_01",
      "name": "Opción múltiple",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": true,
        "instructions": true,
        "typeOption": "TEXT",
        "skipQuestion": true,
        "otherOption": true,
        "score": true,
        "textArea": false,
        "intervalScore": false
      },
      "resolve": {
        "order": 1,
        "title": "¿Cuál es su nivel de experiencia con tecnología educativa?",
        "options": [
          {
            "code": "OPT-1",
            "title": "Principiante",
            "withDescription": true,
            "description": "Tengo conocimientos básicos y estoy aprendiendo",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "Intermedio",
            "withDescription": true,
            "description": "Manejo herramientas básicas con confianza",
            "value": "",
            "score": 2,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "Avanzado",
            "withDescription": true,
            "description": "Domino múltiples herramientas y puedo enseñar a otros",
            "value": "",
            "score": 3,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-4",
            "title": "Experto",
            "withDescription": true,
            "description": "Soy especialista en tecnología educativa",
            "value": "",
            "score": 4,
            "scoreMin": null,
            "scoreMax": null,
            "order": 4,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": true,
        "instructions": "Seleccione la opción que mejor describa su nivel actual. Puede ver las descripciones para más detalles.",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": true,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
        "withScore": true
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_02",
    "codigo": "DEMO-TYPE-02",
    "titulo": "¿Qué herramientas digitales utiliza regularmente? (Selección múltiple)",
    "orden": 2,
    "configuracion": {
      "type": "TYPE_02",
      "name": "Casillas de verificación",
      "configuration": {
        "multipleAswers": true,
        "multipleOptions": true,
        "instructions": true,
        "typeOption": "TEXT",
        "skipQuestion": true,
        "otherOption": true,
        "score": true,
        "textArea": false,
        "intervalScore": false
      },
      "resolve": {
        "order": 2,
        "title": "¿Qué herramientas digitales utiliza regularmente?",
        "options": [
          {
            "code": "OPT-1",
            "title": "Google Classroom",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "Microsoft Teams",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "Zoom",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-4",
            "title": "Kahoot",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 4,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-5",
            "title": "Padlet",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 5,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-6",
            "title": "Canva",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 1,
            "scoreMin": null,
            "scoreMax": null,
            "order": 6,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": true,
        "instructions": "Puede seleccionar múltiples opciones. Marque todas las herramientas que usa frecuentemente.",
        "withMultipleAnswers": true,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": true,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
        "withScore": true
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_03",
    "codigo": "DEMO-TYPE-03",
    "titulo": "¿Cómo calificaría la calidad de la conectividad en su institución?",
    "orden": 3,
    "configuracion": {
      "type": "TYPE_03",
      "name": "Ranking de estrellas",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": false,
        "instructions": true,
        "typeOption": "NUMBER",
        "skipQuestion": true,
        "otherOption": false,
        "score": true,
        "textArea": false,
        "intervalScore": true
      },
      "resolve": {
        "order": 3,
        "title": "¿Cómo calificaría la calidad de la conectividad en su institución?",
        "options": [],
        "withInstructions": true,
        "instructions": "Califique del 1 al 5, donde 1 es muy mala y 5 es excelente.",
        "withMultipleAnswers": false,
        "withMultipleOptions": false,
        "typeOption": "NUMBER",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "NUMBER",
        "intervalScore": [
          { min: 1, max: 1, score: 1 },
          { min: 2, max: 2, score: 2 },
          { min: 3, max: 3, score: 3 },
          { min: 4, max: 4, score: 4 },
          { min: 5, max: 5, score: 5 }
        ],
        "withScore": true
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_04",
    "codigo": "DEMO-TYPE-04",
    "titulo": "Adjunte documentos relacionados con su plan de trabajo digital",
    "orden": 4,
    "configuracion": {
      "type": "TYPE_04",
      "name": "Carga de archivos",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": false,
        "instructions": true,
        "typeOption": "FILE",
        "skipQuestion": true,
        "otherOption": false,
        "score": false,
        "textArea": false,
        "intervalScore": false
      },
      "resolve": {
        "order": 4,
        "title": "Adjunte documentos relacionados con su plan de trabajo digital",
        "options": [],
        "withInstructions": true,
        "instructions": "Puede adjuntar archivos PDF, Word o imágenes. Tamaño máximo: 5MB por archivo.",
        "withMultipleAnswers": false,
        "withMultipleOptions": false,
        "typeOption": "FILE",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "FILE",
        "intervalScore": [],
        "withScore": false
      },
      "answer": null
    },
    "reglas": {
      "required": false,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_05",
    "codigo": "DEMO-TYPE-05",
    "titulo": "Ingrese su correo electrónico institucional",
    "orden": 5,
    "configuracion": {
      "type": "TYPE_05",
      "name": "Cuadro de texto simple",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": false,
        "instructions": true,
        "typeOption": "EMAIL",
        "skipQuestion": true,
        "otherOption": false,
        "score": false,
        "textArea": false,
        "intervalScore": false
      },
      "resolve": {
        "order": 5,
        "title": "Ingrese su correo electrónico institucional",
        "options": [],
        "withInstructions": true,
        "instructions": "Ingrese un correo electrónico válido. Ejemplo: usuario@minedu.gob.pe",
        "withMultipleAnswers": false,
        "withMultipleOptions": false,
        "typeOption": "EMAIL",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "EMAIL",
        "intervalScore": [],
        "withScore": false
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_06",
    "codigo": "DEMO-TYPE-06",
    "titulo": "Describa los principales desafíos que enfrenta al usar tecnología en el aula",
    "orden": 6,
    "configuracion": {
      "type": "TYPE_06",
      "name": "Cuadro de comentario",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": false,
        "instructions": true,
        "typeOption": "TEXT",
        "skipQuestion": true,
        "otherOption": false,
        "score": false,
        "textArea": true,
        "intervalScore": false
      },
      "resolve": {
        "order": 6,
        "title": "Describa los principales desafíos que enfrenta al usar tecnología en el aula",
        "options": [],
        "withInstructions": true,
        "instructions": "Comparta su experiencia en detalle. Mínimo 50 caracteres, máximo 500 caracteres.",
        "withMultipleAnswers": false,
        "withMultipleOptions": false,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": true,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
        "intervalScore": [],
        "withScore": false
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_07",
    "codigo": "DEMO-TYPE-07",
    "titulo": "¿Cuántos estudiantes tiene a su cargo?",
    "orden": 7,
    "configuracion": {
      "type": "TYPE_07",
      "name": "Cantidad",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": false,
        "instructions": true,
        "typeOption": "NUMBER",
        "skipQuestion": true,
        "otherOption": false,
        "score": true,
        "textArea": false,
        "intervalScore": true
      },
      "resolve": {
        "order": 7,
        "title": "¿Cuántos estudiantes tiene a su cargo?",
        "options": [],
        "withInstructions": true,
        "instructions": "Ingrese el número total de estudiantes. Rango válido: 1 a 50 estudiantes.",
        "withMultipleAnswers": false,
        "withMultipleOptions": false,
        "typeOption": "NUMBER",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "NUMBER",
        "intervalScore": [
          { min: 1, max: 10, score: 1 },
          { min: 11, max: 20, score: 2 },
          { min: 21, max: 30, score: 3 },
          { min: 31, max: 40, score: 4 },
          { min: 41, max: 50, score: 5 }
        ],
        "withScore": true
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  },
  {
    "id": "demo_type_08",
    "codigo": "DEMO-TYPE-08",
    "titulo": "¿Cuándo fue la última vez que recibió capacitación en tecnología educativa?",
    "orden": 8,
    "configuracion": {
      "type": "TYPE_08",
      "name": "Fecha",
      "configuration": {
        "multipleAswers": false,
        "multipleOptions": false,
        "instructions": true,
        "typeOption": "DATE",
        "skipQuestion": true,
        "otherOption": false,
        "score": false,
        "textArea": false,
        "intervalScore": false
      },
      "resolve": {
        "order": 8,
        "title": "¿Cuándo fue la última vez que recibió capacitación en tecnología educativa?",
        "options": [],
        "withInstructions": true,
        "instructions": "Seleccione la fecha de su última capacitación. Si no recuerda la fecha exacta, aproxime al mes.",
        "withMultipleAnswers": false,
        "withMultipleOptions": false,
        "typeOption": "DATE",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": true,
        "formatOtherOption": "DATE",
        "intervalScore": [],
        "withScore": false
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": false,
      "rules": []
    }
  }
];

// Componente para renderizar una pregunta individual
const QuestionFormItem: React.FC<{
  questionItem: any;
  index: number;
  control: any;
}> = ({ questionItem, control }) => {
  // Extraer la configuración del ítem
  const question = questionItem.configuracion as QuestionConfig;
  
  // Crear control para la pregunta principal usando el código único de la pregunta
  const questionControl = useFormControl(
    `question_${questionItem.codigo}`,
    control,
    { required: questionItem.reglas.required },
    ''
  );
  
  // Control para opción "Otro" - solo se usa si la pregunta lo permite
  const otherControl = useFormControl(
    `question_${questionItem.codigo}_other`,
    control,
    {},
    ''
  );
  
  // Controles específicos para carga de archivos
  const sizeControl = useFormControl(
    `question_${questionItem.codigo}_size`,
    control,
    {},
    ''
  );
  
  const extensionControl = useFormControl(
    `question_${questionItem.codigo}_extension`,
    control,
    {},
    ''
  );
  
  const nameFileControl = useFormControl(
    `question_${questionItem.codigo}_filename`,
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
      <View style={styles.questionHeader}>
        <Text style={styles.questionType}>{question.name} - {question.type}</Text>
        <Text style={styles.questionTitle}>{questionItem.titulo}</Text>
      </View>
      
      <ResolveQuestionConfigurationForm
        number={questionItem.orden}
        question={question}
        control={questionControl}
        controlOther={actualOtherControl}
        controlSize={actualSizeControl}
        controlExtension={actualExtensionControl}
        controlNameFile={actualNameFileControl}
        readOnly={false}
        onChangeValue={(value) => {
          console.log(`[${question.type}] Valor cambiado en ${questionItem.codigo}:`, value);
        }}
      />
    </View>
  );
};

// Componente principal para el formulario completo de demostración
export const SimonAllTypesForm: React.FC = () => {
  // Usar React Hook Form para gestionar el formulario
  const { control, handleSubmit, watch } = useForm<FormData>();
  
  // Observar todos los valores para mostrar el estado actual
  const watchedValues = watch();
  
  // Manejar envío del formulario
  const onSubmit = (data: FormData) => {
    console.log('=== DATOS COMPLETOS DEL FORMULARIO ===');
    console.log(JSON.stringify(data, null, 2));
    
    Alert.alert(
      'Formulario Enviado',
      'Revise la consola para ver todos los datos capturados.',
      [{ text: 'OK' }]
    );
  };
  
  // Función para mostrar el estado actual del formulario
  const showCurrentState = () => {
    console.log('=== ESTADO ACTUAL DEL FORMULARIO ===');
    console.log(JSON.stringify(watchedValues, null, 2));
    
    Alert.alert(
      'Estado Actual',
      'Revise la consola para ver el estado actual del formulario.',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Framework SIMON - Todos los Tipos de Componentes</Text>
      <Text style={styles.subHeader}>Formulario de Demostración Completo</Text>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Este formulario incluye todos los 8 tipos de componentes del Framework SIMON:
          </Text>
          <Text style={styles.typesList}>
            • TYPE_01: Opción múltiple con descripciones{'\n'}
            • TYPE_02: Casillas de verificación múltiple{'\n'}
            • TYPE_03: Ranking de estrellas{'\n'}
            • TYPE_04: Carga de archivos{'\n'}
            • TYPE_05: Cuadro de texto simple (email){'\n'}
            • TYPE_06: Cuadro de comentario (textarea){'\n'}
            • TYPE_07: Cantidad numérica{'\n'}
            • TYPE_08: Fecha
          </Text>
        </View>
        
        {allTypesQuestionData.map((questionItem, index) => (
          <QuestionFormItem
            key={questionItem.id}
            questionItem={questionItem}
            index={index}
            control={control}
          />
        ))}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Ver Estado Actual"
              onPress={showCurrentState}
              color="#17a2b8"
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Enviar Formulario"
              onPress={handleSubmit(onSubmit)}
              color="#28a745"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#6f42c1',
    color: 'white',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    padding: 8,
    backgroundColor: '#6f42c1',
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  infoText: {
    fontSize: 14,
    color: '#004085',
    marginBottom: 8,
    fontWeight: '600',
  },
  typesList: {
    fontSize: 12,
    color: '#004085',
    lineHeight: 18,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  questionType: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionTitle: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
}); 