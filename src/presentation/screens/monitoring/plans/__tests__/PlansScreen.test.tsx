import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PlansScreen } from '../PlansScreen';
import { useMonitoringStore, useAuthStore } from '../../../../store';

// Mocks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: { mode: 'EXECUTION' },
  }),
  StackActions: {
    popToTop: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../../../store', () => ({
  useMonitoringStore: jest.fn(),
  useAuthStore: jest.fn(),
}));

const mockPlans = [
  { code: 'PLAN001', name: 'Plan de Prueba Uno', key: '1', enuType: 1 },
  { code: 'PLAN002', name: 'Plan de Prueba Dos', key: '2', enuType: 1 },
];

describe('PlansScreen', () => {
  beforeEach(() => {
    (useAuthStore as any).mockImplementation((selector: any) => 
      selector({
        currentSite: { roleCode: 'ADMIN', name: 'Site Test' },
        currentInstitution: null,
      })
    );
    (useMonitoringStore as any).mockImplementation((selector: any) => 
      selector({
        getPlans: jest.fn().mockResolvedValue({
          status: { success: true },
          data: mockPlans,
        }),
      })
    );
  });

  it('debe renderizar correctamente los planes iniciales', async () => {
    const { getByText } = render(<PlansScreen />);
    
    await waitFor(() => {
      expect(getByText('Planes de monitoreo')).toBeTruthy();
      expect(getByText('Plan de Prueba Uno')).toBeTruthy();
      expect(getByText('Plan de Prueba Dos')).toBeTruthy();
    });
  it('debe filtrar los planes por texto', async () => {
    const { getByPlaceholderText, queryByText, getByText } = render(<PlansScreen />);
    
    await waitFor(() => {
      expect(getByText('Plan de Prueba Uno')).toBeTruthy();
      expect(getByText('Plan de Prueba Dos')).toBeTruthy();
    });

    const input = getByPlaceholderText('Buscar plan...');
    fireEvent.changeText(input, 'Uno');

    // Debemos esperar el debounce (300ms)
    await waitFor(() => {
      expect(getByText('Plan de Prueba Uno')).toBeTruthy();
      expect(queryByText('Plan de Prueba Dos')).toBeNull();
    }, { timeout: 1000 });
  });

  it('debe mostrar el estado vacío si no hay coincidencias', async () => {
    const { getByPlaceholderText, getByText } = render(<PlansScreen />);
    
    const input = getByPlaceholderText('Buscar plan...');
    fireEvent.changeText(input, 'Texto inexistente');

    await waitFor(() => {
      expect(getByText('No se encontraron planes de monitoreo')).toBeTruthy();
    }, { timeout: 1000 });
  });
});
