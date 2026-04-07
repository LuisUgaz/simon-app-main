export interface IntervalScore {
    min: any;                   // Valor mínimo
    max: any;                   // Valor máximo
    score: number;              // Puntuación asignada
    format: 'NUMBER' | 'DATE' | 'DATETIME';
} 