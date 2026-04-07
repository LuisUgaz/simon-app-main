export interface Configuration {
    multipleAswers: boolean;    // Respuestas múltiples 
    multipleOptions: boolean;   // Alternativas múltiples
    instructions: boolean;      // Permite instrucciones
    typeOption: 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT';
    skipQuestion: boolean;      // Permite saltar pregunta
    otherOption: boolean;       // Opción "Otro"
    score: boolean;             // Calificación
    textArea: boolean;          // Área de texto
    intervalScore: boolean;     // Intervalos de calificación
} 