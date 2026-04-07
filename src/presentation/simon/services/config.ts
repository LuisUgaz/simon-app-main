import { QuestionConfig } from '../interfaces/question-config';
import { mergeDeep } from '../utils/merge-deep';

// Iconos (usaremos nombres que luego se mapean a iconos de React Native Vector Icons)
const ICONS = {
  formatListBulleted: 'format-list-bulleted',
  checkBox: 'checkbox-marked',
  starBorder: 'star-outline',
  cloudUpload: 'cloud-upload',
  shortText: 'text-short',
  wrapText: 'text-box',
  looksOne: 'numeric-1',
  today: 'calendar-today'
};

// Configuración predeterminada para Opción múltiple
const defaultConfig: QuestionConfig = {
  type: 'TYPE_01',
  name: 'Opción múltiple',
  icon: ICONS.formatListBulleted,
  configuration: {
    multipleAswers: false,
    multipleOptions: true,
    instructions: true,
    typeOption: 'TEXT',
    skipQuestion: true,
    otherOption: true,
    score: true,
    textArea: false,
    intervalScore: false
  },
  resolve: {
    order: 0,
    title: '',
    options: [],
    withInstructions: false,
    instructions: '',
    withMultipleAnswers: false,
    withMultipleOptions: true,
    typeOption: 'TEXT',
    withSkipQuestion: true,
    withOtherOption: false,
    isTextArea: false,
    withOnlyDate: false,
    formatOtherOption: 'TEXT',
    intervalScore: [],
    withScore: true,
  },
  answer: {
    apply: true,
    result: [
      {
        title: '',
        value: '',
        score: 0,
        order: 1,
        isCorrect: false,
        isOther: false,
        scoreMin: '0',
        scoreMax: '0'
      }
    ],
  }
};

// Tipos de preguntas definidos
export const QUESTION_TYPES = {
  multipleOpcion: 'TYPE_01',
  casillaVerificacion: 'TYPE_02',
  rankinkEstrella: 'TYPE_03',
  cargaArchivos: 'TYPE_04',
  cuadroTextoSimple: 'TYPE_05',
  cuadroComentario: 'TYPE_06',
  Cantidad: 'TYPE_07',
  FechaHora: 'TYPE_08'
};

// Configuraciones para cada tipo de pregunta
export const configs: QuestionConfig[] = [
  defaultConfig,
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_02',
    name: 'Casillas de verificación',
    icon: ICONS.checkBox,
    configuration: {
      multipleAswers: true
    },
    resolve: {
      multipleAswers: true
    }
  }),
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_03',
    name: 'Ranking de estrellas',
    icon: ICONS.starBorder,
    configuration: {
      multipleAswers: false,
      multipleOptions: false,
      otherOption: false
    },
    resolve: {
      withMultipleOptions: false,
      withOtherOption: false
    }
  }),
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_04',
    name: 'Carga de archivos',
    icon: ICONS.cloudUpload,
    configuration: {
      multipleAswers: false,
      multipleOptions: false,
      otherOption: false,
      instructions: true,
      score: false
    },
    resolve: {
      withMultipleOptions: false,
      withOtherOption: false,
      withInstructions: false,
      withScore: false,
      instructions: ''
    }
  }),
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_05',
    name: 'Cuadro de texto simple',
    icon: ICONS.shortText,
    configuration: {
      multipleAswers: false,
      multipleOptions: false,
      otherOption: false,
      score: false
    },
    resolve: {
      withMultipleOptions: false,
      withOtherOption: false,
      withInstructions: false,
      withScore: true
    }
  }),
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_06',
    name: 'Cuadro de comentario',
    icon: ICONS.wrapText,
    configuration: {
      multipleAswers: false,
      multipleOptions: false,
      otherOption: false,
      textArea: true,
      score: false
    },
    resolve: {
      withMultipleOptions: false,
      withOtherOption: false,
      withInstructions: false,
      isTextArea: true,
      withScore: true
    }
  }),
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_07',
    name: 'Cantidad',
    icon: ICONS.looksOne,
    configuration: {
      multipleAswers: false,
      multipleOptions: false,
      otherOption: false,
      textArea: false,
      typeOption: 'NUMBER',
      intervalScore: true
    },
    resolve: {
      withMultipleOptions: false,
      withOtherOption: false,
      withInstructions: false,
      isTextArea: false,
      typeOption: 'NUMBER',
      intervalScore: []
    }
  }),
  mergeDeep({ ...defaultConfig }, {
    type: 'TYPE_08',
    name: 'Fecha',
    icon: ICONS.today,
    configuration: {
      multipleAswers: false,
      multipleOptions: false,
      otherOption: false,
      typeOption: 'DATE',
      textArea: false,
      intervalScore: true
    },
    resolve: {
      withMultipleOptions: false,
      withOtherOption: false,
      withInstructions: false,
      typeOption: 'DATE',
      isTextArea: false,
      intervalScore: []
    }
  })
]; 