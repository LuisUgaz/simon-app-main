import { useState, useEffect, useMemo, useCallback } from 'react';
import { useController, UseControllerProps } from 'react-hook-form';

/**
 * Hook personalizado para crear controles compatibles con los componentes
 * que simulan el comportamiento de Angular FormControl
 *
 * @param name Nombre del campo en el formulario
 * @param control Control de React Hook Form
 * @param rules Reglas de validación
 * @param defaultValue Valor predeterminado
 * @returns Objeto similar a FormControl de Angular
 */
export const useFormControl = (
  name: string,
  control: any,
  rules?: UseControllerProps['rules'],
  defaultValue?: any,
) => {
  const {
    field,
    fieldState: { invalid, isTouched, error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  const [enabled, setEnabled] = useState(true);
  const [subscriptionCallback, setSubscriptionCallback] = useState<((value: any) => void) | null>(null);

  useEffect(() => {
    if (subscriptionCallback) {
      subscriptionCallback(field.value);
    }
  }, [field.value, subscriptionCallback]);

  const handleEnable = useCallback(() => setEnabled(true), []);
  const handleDisable = useCallback(() => setEnabled(false), []);

  const handleChange = useCallback((value: any) => {
    field.onChange(value);
  }, [field]);

  const handleSetValue = useCallback((value: any) => {
    field.onChange(value);
  }, [field]);

  const handleReset = useCallback(() => {
    field.onChange(defaultValue);
  }, [field, defaultValue]);

  const handleSubscribe = useCallback((callback: (value: any) => void) => {
    setSubscriptionCallback(() => callback);

    return {
      unsubscribe: () => {
        setSubscriptionCallback(null);
      },
    };
  }, []);

  const formControl = useMemo(() => ({
    get value() {
      return field.value;
    },
    onChange: handleChange,
    onBlur: field.onBlur,
    get enabled() {
      return enabled;
    },
    get valid() {
      return !invalid;
    },
    get touched() {
      return isTouched;
    },
    error,
    setValue: handleSetValue,
    reset: handleReset,
    setValidators: () => {},
    updateValueAndValidity: () => {},
    subscribe: handleSubscribe,
    enable: handleEnable,
    disable: handleDisable,
  }), [field.value, field.onBlur, enabled, invalid, isTouched, error, handleChange, handleSetValue, handleReset, handleSubscribe, handleEnable, handleDisable]);

  return formControl;
};
