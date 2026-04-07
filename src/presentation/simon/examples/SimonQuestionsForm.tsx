import React from 'react';
import { View, ScrollView, StyleSheet, Button, Text } from 'react-native';
import { useForm } from 'react-hook-form';

// Importar componentes del módulo Simon
import { ResolveQuestionConfigurationForm } from '../components/ResolveQuestionConfigurationForm';
import { useFormControl } from '../hooks/useFormControl';
import { QuestionConfig } from '../interfaces/question-config';

// Definir interfaz para el tipo de datos del formulario
interface FormData {
  [key: string]: string | string[];
}

// Datos del formulario (preguntas)
const questionData = [
  {
    "id": "60b85df30d5d2e3fce769b58",
    "idInstrumento": "60b85da00d5d2e3fce769b57",
    "idItem": "608b476813726a96377d808a",
    "idAspecto": "608b44fb13726a96377d8087",
    "titulo": "¿En qué instancia trabaja Usted?",
    "codigo": "C-01.AR01.IT01",
    "etiquetas": [],
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
        "order": 0,
        "title": "¿En qué instancia trabaja Usted?",
        "options": [
          {
            "code": "OPT-1",
            "title": "En la DRE",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 4,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "En la UGEL",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "En una IE",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-4",
            "title": "Soy docente de Aula",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": false,
        "instructions": "",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
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
    "id": "60b85df30d5d2e3fce769b59",
    "idInstrumento": "60b85da00d5d2e3fce769b57",
    "idItem": "608b47f213726a96377d808b",
    "idAspecto": "608b44fb13726a96377d8087",
    "titulo": "¿Cuenta con el servicio de Internet?",
    "codigo": "C-01.AR01.IT02",
    "etiquetas": [],
    "orden": 2,
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
        "order": 0,
        "title": "¿Cuenta con el servicio de Internet? ",
        "options": [
          {
            "code": "OPT-1",
            "title": "Sí, con servicio continua",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "Sí, con servicio parcial",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "No cuento con el servicio",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": false,
        "instructions": "",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
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
    "id": "60b85df30d5d2e3fce769b5a",
    "idInstrumento": "60b85da00d5d2e3fce769b57",
    "idItem": "608b490013726a96377d808c",
    "idAspecto": "608b44fb13726a96377d8087",
    "titulo": "¿Quién es su proveedor de internet?",
    "codigo": "C-01.AR01.IT03",
    "etiquetas": [],
    "orden": 3,
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
        "order": 0,
        "title": "¿Quién es su proveedor de internet?",
        "options": [
          {
            "code": "OPT-1",
            "title": "Movistar",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "Claro",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "Bitel",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-4",
            "title": "Entel",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": true,
        "instructions": "Solo ingrese el nombre del operador.",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": true,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
        "withScore": false
      },
      "answer": null
    },
    "reglas": {
      "required": true,
      "itsDependent": true,
      "rules": [
        {
          "codeQuestion": "608b47f213726a96377d808b",
          "options": [
            {
              "code": "OPT-2"
            },
            {
              "code": "OPT-1"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "60b85df30d5d2e3fce769b5b",
    "idInstrumento": "60b85da00d5d2e3fce769b57",
    "idItem": "608b49c413726a96377d808d",
    "idAspecto": "608b44fb13726a96377d8087",
    "titulo": "¿Con qué dispositivo(s) accede a Internet?",
    "codigo": "C-01.AR01.IT04",
    "etiquetas": [],
    "orden": 4,
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
        "order": 0,
        "title": "¿Con qué dispositivo(s) accede a Internet?",
        "options": [
          {
            "code": "OPT-1",
            "title": "Computadora de Escritorio Propia",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "Computadora de Escritorio de una cabina",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "Laptop personal",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-4",
            "title": "Laptop de la institución",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-5",
            "title": "Tableta",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-6",
            "title": "Celular",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": true,
        "instructions": "Puede marca mas de una opción.",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
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
    "id": "60b85df30d5d2e3fce769b5c",
    "idInstrumento": "60b85da00d5d2e3fce769b57",
    "idItem": "608b4a4e13726a96377d808e",
    "idAspecto": "608b44fb13726a96377d8087",
    "titulo": "¿La IE (local educativo) cuenta con Internet?",
    "codigo": "C-01.AR01.IT05",
    "etiquetas": [],
    "orden": 5,
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
        "order": 0,
        "title": "¿La IE (local educativo) cuenta con Internet?",
        "options": [
          {
            "code": "OPT-1",
            "title": "Si",
            "withDescription": true,
            "description": "Si la IE cuenta con el servicio.",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "No",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": false,
        "instructions": "",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": false,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
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
    "id": "60b85df30d5d2e3fce769b5d",
    "idInstrumento": "60b85da00d5d2e3fce769b57",
    "idItem": "608b4ac813726a96377d808f",
    "idAspecto": "608b44fb13726a96377d8087",
    "titulo": "¿Quién financia el costo del servicio de internet?",
    "codigo": "C-01.AR01.IT06",
    "etiquetas": [],
    "orden": 6,
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
        "order": 0,
        "title": "¿Quién financia el costo del servicio de internet?",
        "options": [
          {
            "code": "OPT-1",
            "title": "APAFA",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 1,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-2",
            "title": "La Municipalidad",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 2,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-3",
            "title": "La UGEL",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 3,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-4",
            "title": "La DRE",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          },
          {
            "code": "OPT-5",
            "title": "El Minedu",
            "withDescription": false,
            "description": "",
            "value": "",
            "score": 0,
            "scoreMin": null,
            "scoreMax": null,
            "order": 0,
            "isCorrect": false,
            "isOther": false,
            "formart": null
          }
        ],
        "withInstructions": false,
        "instructions": "",
        "withMultipleAnswers": false,
        "withMultipleOptions": true,
        "typeOption": "TEXT",
        "withSkipQuestion": true,
        "withOtherOption": true,
        "isTextArea": false,
        "withOnlyDate": false,
        "formatOtherOption": "TEXT",
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
      <ResolveQuestionConfigurationForm
        number={questionItem.orden}
        question={question}
        control={questionControl}
        controlOther={actualOtherControl}
        controlSize={actualSizeControl}
        controlExtension={actualExtensionControl}
        controlNameFile={actualNameFileControl}
        readOnly={false}
        onChangeValue={(value) => console.log(`Valor cambiado en ${questionItem.codigo}:`, value)}
      />
    </View>
  );
};

// Componente principal para el formulario de preguntas
export const SimonQuestionsForm: React.FC = () => {
  // Usar React Hook Form para gestionar el formulario
  const { control, handleSubmit } = useForm<FormData>();
  
  // Manejar envío del formulario
  const onSubmit = (data: FormData) => {
    console.log('Datos del formulario:', data);
    // Aquí enviarías los datos al backend
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cuestionario sobre Conectividad</Text>
      
      <ScrollView style={styles.formContainer}>
        {questionData.map((questionItem, index) => (
          <QuestionFormItem
            key={questionItem.id}
            questionItem={questionItem}
            index={index}
            control={control}
          />
        ))}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Enviar Respuestas"
          onPress={handleSubmit(onSubmit)}
          color="#007bff"
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
    backgroundColor: '#007bff',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
}); 