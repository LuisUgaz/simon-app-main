import { create } from 'zustand';
import { Sample, Visit, VisitAnswer } from '../../core/entities';


export interface SampleState {
    sample?: Sample;
    visit?: Visit;
    visitAnswer?: VisitAnswer;

    setSample: (value?: Sample) => void;
    clearSample: () => void;
    setVisit: (value?: Visit) => void;
    setVisitAnswer: (value?: VisitAnswer) => void;
    clearVisitAnswer: () => void;
    clearVisit: () => void;
    markAspectAsCompleted: (aspectId: string) => void;
}


export const useSampleStore = create<SampleState>()((set, get) => ({

    sample: undefined,
    visit: undefined,
    visitAnswer: undefined,
    setSample: (value?: Sample) => {
        set({ sample: value });
    },

    clearSample: () => {
        set({ sample: undefined });
    },

    setVisit: (value?: Visit) => {
        set({ visit: value });
    },

    setVisitAnswer: (value?: VisitAnswer) => {
        set({ visitAnswer: value });
    },

    clearVisitAnswer: () => {
        set({ visitAnswer: undefined });
    },

    clearVisit: () => {
        set({ visit: undefined });
    },

    markAspectAsCompleted: (aspectId: string) => {
        const state = get();
        if (state.visitAnswer) {
            const currentCompletedAspects = state.visitAnswer.completedAspects || [];
            if (!currentCompletedAspects.includes(aspectId)) {
                const updatedVisitAnswer = {
                    ...state.visitAnswer,
                    completedAspects: [...currentCompletedAspects, aspectId]
                };
                set({ visitAnswer: updatedVisitAnswer });
            }
        }
    },

}))