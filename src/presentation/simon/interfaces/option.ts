export interface Option {
    code?: string;              // Código único
    title: string;              // Texto
    withDescription?: boolean;  // Tiene descripción
    description?: string;       // Texto descriptivo
    value: string;              // Valor seleccionado
    score: number;              // Puntuación
    scoreMin: string;           // Puntuación mínima
    scoreMax: string;           // Puntuación máxima
    order: number;              // Orden
    isCorrect: boolean;         // Es correcta
    isOther: boolean;           // Es opción "Otro"
    format?: 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT';
} 