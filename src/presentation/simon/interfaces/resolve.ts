
import { Option } from './option';
import { IntervalScore } from './interval-score';

export interface Resolve {
    order: number;              // Orden
    title: string;              // Título
    options: Option[];          // Opciones
    withInstructions: boolean;  // Muestra instrucciones
    instructions: string;       // Texto de instrucciones
    withMultipleAnswers: boolean; // Múltiples respuestas
    withMultipleOptions: boolean; // Múltiples opciones
    typeOption: 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT';
    withSkipQuestion: boolean;  // Permite saltar
    withOtherOption: boolean;   // Incluye "Otro"
    isTextArea: boolean;        // Es área de texto
    withOnlyDate: boolean;      // Solo fecha
    formatOtherOption: 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT';
    intervalScore: IntervalScore[]; // Intervalos
    withScore: boolean;         // Con calificación
} 