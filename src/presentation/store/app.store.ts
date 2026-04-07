import { create } from 'zustand';

export type SnackbarType = 'success' | 'error' | 'warning';

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  showSnackbar: (message: string, type?: SnackbarType) => void;
  hideSnackbar: () => void;
}

export const useAppStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  type: 'success',
  showSnackbar: (message, type = 'success') => set({ visible: true, message, type }),
  hideSnackbar: () => set({ visible: false, message: '', type: 'success' }),
})); 