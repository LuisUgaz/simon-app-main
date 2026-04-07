import { Configuration } from './configuration';
import { Resolve } from './resolve';
import { Answer } from './answer';

export interface QuestionConfig {
    type: 'TYPE_01' | 'TYPE_02' | 'TYPE_03' | 'TYPE_04' | 'TYPE_05' | 'TYPE_06' | 'TYPE_07' | 'TYPE_08';
    name: string;
    icon: any;
    labels?: string[];
    configuration: Configuration;
    resolve: Resolve;
    answer: Answer;
} 