import {create} from 'zustand';

interface ItemControlState {
  enabled: boolean;
  value: any;
}

interface ItemControlsStore {
  controls: Map<string, ItemControlState>;
  setControlEnabled: (itemCode: string, enabled: boolean) => void;
  setControlValue: (itemCode: string, value: any) => void;
  getControlState: (itemCode: string) => ItemControlState | undefined;
  initializeControl: (itemCode: string, enabled: boolean) => void;
  clearControls: () => void;
}

export const useItemControlsStore = create<ItemControlsStore>((set, get) => ({
  controls: new Map(),

  setControlEnabled: (itemCode: string, enabled: boolean) => {
    set(state => {
      const newControls = new Map(state.controls);
      const current = newControls.get(itemCode) || {enabled: true, value: null};
      newControls.set(itemCode, {...current, enabled});
      return {controls: newControls};
    });
  },

  setControlValue: (itemCode: string, value: any) => {
    set(state => {
      const newControls = new Map(state.controls);
      const current = newControls.get(itemCode) || {enabled: true, value: null};
      newControls.set(itemCode, {...current, value});
      return {controls: newControls};
    });
  },

  getControlState: (itemCode: string) => {
    return get().controls.get(itemCode);
  },

  initializeControl: (itemCode: string, enabled: boolean) => {
    set(state => {
      const newControls = new Map(state.controls);
      if (!newControls.has(itemCode)) {
        newControls.set(itemCode, {enabled, value: null});
      }
      return {controls: newControls};
    });
  },

  clearControls: () => {
    set({controls: new Map()});
  },
}));
