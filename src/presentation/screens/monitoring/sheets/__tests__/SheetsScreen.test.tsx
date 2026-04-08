import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SheetsScreen } from '../SheetsScreen';
import { useMonitoringStore } from '../../../../store';

// Mocks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { plan: { id: 'PLAN1', name: 'Plan de Prueba' } },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../../../store', () => ({
  useMonitoringStore: jest.fn(),
}));

const mockInstruments = [
  { code: 'SHEET001', name: 'Ficha de Prueba Uno', id: '1', key: '1' },
  { code: 'SHEET002', name: 'Ficha de Prueba Dos', id: '2', key: '2' },
];

describe('SheetsScreen', () => {
  beforeEach(() => {
    (useMonitoringStore as any).mockImplementation((selector: any) => 
      selector({
        currentMonitoringPlan: { id: 'PLAN1', name: 'Plan de Prueba' },
        getInstruments: jest.fn().mockResolvedValue({
          status: { success: true },
          data: mockInstruments,
        }),
        setCurrentPlan: jest.fn(),
        clearInstrument: jest.fn(),
      })
    );
  });

  it('debe renderizar correctamente las fichas iniciales', async () => {
    const { getByText } = render(<SheetsScreen />);
    
    await waitFor(() => {
      expect(getByText('Fichas de monitoreo')).toBeTruthy();
      expect(getByText('Ficha de Prueba Uno')).toBeTruthy();
      expect(getByText('Ficha de Prueba Dos')).toBeTruthy();
    });
  });

  it('debe mostrar el campo de búsqueda', () => {
    const { getByPlaceholderText } = render(<SheetsScreen />);
    expect(getByPlaceholderText('Buscar ficha...')).toBeTruthy();
  });

  it('debe filtrar las fichas por texto', async () => {
    const { getByPlaceholderText, queryByText, getByText } = render(<SheetsScreen />);
    
    await waitFor(() => {
      expect(getByText('Ficha de Prueba Uno')).toBeTruthy();
    });

    const input = getByPlaceholderText('Buscar ficha...');
    fireEvent.changeText(input, 'Uno');

    await waitFor(() => {
      expect(getByText('Ficha de Prueba Uno')).toBeTruthy();
      expect(queryByText('Ficha de Prueba Dos')).toBeNull();
    }, { timeout: 1000 });
  });

  it('debe mostrar el estado vacío si no hay coincidencias', async () => {
    const { getByPlaceholderText, getByText } = render(<SheetsScreen />);
    
    const input = getByPlaceholderText('Buscar ficha...');
    fireEvent.changeText(input, 'Texto inexistente');

    await waitFor(() => {
      expect(getByText('No se encontraron fichas de monitoreo')).toBeTruthy();
    }, { timeout: 1000 });
  });
});
