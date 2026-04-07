import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';

import { useMonitoringStore } from '../../../../store/monitoring.store';
import { InstrumentItem } from '../../../../../core/entities';
import { ItemFormComponent } from './ItemFormComponent';
import { useItemControlsStore } from '../stores/itemControlsStore';

const APP_COLORS = {
  primary: '#bf0909',
  secondary: '#494949',
  accent: '#75a25d',
  background: '#f5f5f5',
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
};

interface FormData {
  [key: string]: string | string[];
}

const TYPE_CASILLA_VERIFICACION = 'TYPE_02';
const TYPE_MULTIPLE_OPCION = 'TYPE_01';
const TYPE_RANKING_ESTRELLA = 'TYPE_03';
const TYPE_CANTIDAD = 'TYPE_07';
const TYPE_FECHA_HORA = 'TYPE_08';

interface InstrumentItemsFormProps {
  showHeader?: boolean;
  readonly?: boolean;
}

export const InstrumentItemsForm: React.FC<InstrumentItemsFormProps> = ({
  showHeader = true,
  readonly = false,
}) => {
  const { currentInstrumentItems, currentFormData, setCurrentFormData } =
    useMonitoringStore();

  const { setControlEnabled, setControlValue } = useItemControlsStore();

  console.log(
    'InstrumentItemsForm render - currentInstrumentItems:',
    currentInstrumentItems?.length || 0,
    'items',
  );
  console.log('InstrumentItemsForm render - currentFormData:', currentFormData);

  // Estado para controlar si estamos actualizando desde el store
  const [isUpdatingFromStore, setIsUpdatingFromStore] = React.useState(false);

  // Referencia para los últimos datos del formulario
  const lastFormValuesRef = React.useRef<any>({});

  // Usar React Hook Form para gestionar el formulario con valores iniciales
  const { control, watch, reset } = useForm<FormData>({
    defaultValues: currentFormData || {},
  });

  // Referencia para el último currentFormData procesado
  const lastFormDataRef = React.useRef(currentFormData);

  // Función para comparar objetos profundamente (solo primeras dos niveles)
  const deepEqual = React.useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) {
      return true;
    }
    if (!obj1 || !obj2) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        if (obj1[key].length !== obj2[key].length) {
          return false;
        }
        if (
          obj1[key].some(
            (item: any, index: number) => item !== obj2[key][index],
          )
        ) {
          return false;
        }
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }, []);

  // Actualizar el formulario cuando cambian los datos del store (solo si realmente cambió)
  React.useEffect(() => {
    if (
      currentFormData &&
      !deepEqual(currentFormData, lastFormDataRef.current)
    ) {
      console.log(
        '🔄 Actualizando formulario con datos del store:',
        currentFormData,
      );
      setIsUpdatingFromStore(true);
      reset(currentFormData);
      lastFormDataRef.current = currentFormData;
      lastFormValuesRef.current = { ...currentFormData };

      // Resetear flag después de un breve delay
      setTimeout(() => {
        setIsUpdatingFromStore(false);
      }, 100);
    }
  }, [currentFormData, reset, deepEqual]);

  const evaluateItemRules = React.useCallback(
    (item: InstrumentItem, updatedFormData?: FormData): boolean => {
      if (!item.rules?.rules || item.rules.rules.length === 0) {
        return true;
      }

      const formDataToUse = updatedFormData || currentFormData;

      let enabled = true;
      if (item.code === 'C-231.AR01.IT02') {
        console.log('item evaluateItemRules', item);
      }
      for (const rule of item.rules.rules) {
        const dependentItem = currentInstrumentItems?.find(
          x => x.itemId === rule.codeQuestion,
        );
        if (!dependentItem) {
          continue;
        }

        const dependentFieldName = dependentItem.code.replace(/\./g, '_');
        const dependentValue = formDataToUse?.[dependentFieldName];
        const dependentType = dependentItem.configuration.type;

        if (item.code === 'C-231.AR01.IT02') {
          console.log(formDataToUse, dependentFieldName, dependentValue, dependentType);
        }

        if (dependentType === TYPE_CASILLA_VERIFICACION) {
          if (dependentValue != null && Array.isArray(dependentValue)) {
            enabled = rule.options.some(opt =>
              dependentValue.includes(opt.code),
            );
          } else {
            enabled = false;
          }
        } else if (
          dependentType === TYPE_MULTIPLE_OPCION ||
          dependentType === TYPE_RANKING_ESTRELLA
        ) {
          if (item.code === 'C-231.AR01.IT02') {
            console.log('rule.options', rule.options, 'dependentValue', dependentValue)
          }
          enabled = rule.options.some(opt => opt.code === dependentValue);
        } else if (dependentType === TYPE_CANTIDAD) {
          const selectedOption =
            dependentItem.configuration.resolve.options.find(
              opt =>
                dependentValue > (opt.scoreMin || 0) &&
                dependentValue <= (opt.scoreMax || 0),
            );
          enabled = selectedOption
            ? rule.options.some(opt => opt.code === selectedOption.code)
            : false;
        } else if (dependentType === TYPE_FECHA_HORA) {
          const selectedOption =
            dependentItem.configuration.resolve.options.find(
              opt =>
                new Date(dependentValue) > new Date(opt.scoreMin || 0) &&
                new Date(dependentValue) <= new Date(opt.scoreMax || 0),
            );
          enabled = selectedOption
            ? rule.options.some(opt => opt.code === selectedOption.code)
            : false;
        }

        if (!enabled) {
          break;
        }
      }

      return enabled;
    },
    [currentInstrumentItems, currentFormData],
  );

  const handleItemChange = React.useCallback(
    (itemCode: string, value: any) => {
      if (!currentInstrumentItems) {
        return;
      }

      const changedItem = currentInstrumentItems.find(x => x.code === itemCode);
      if (!changedItem) {
        return;
      }

      setControlValue(itemCode, value);

      // Crear formData actualizado con el nuevo valor para evaluar reglas correctamente
      const fieldName = itemCode.replace(/\./g, '_');
      const updatedFormData: FormData = {
        ...currentFormData,
        [fieldName]: value,
      };

      const dependentItems = currentInstrumentItems.filter(x =>
        x.rules?.rules?.some(rule => rule.codeQuestion === changedItem.itemId),
      );

      dependentItems.forEach(depItem => {
        const shouldEnable = evaluateItemRules(depItem, updatedFormData);
        setControlEnabled(depItem.code, shouldEnable);
        if (!shouldEnable) {
          setControlValue(depItem.code, null);
        }
      });
    },
    [currentInstrumentItems, currentFormData, evaluateItemRules, setControlEnabled, setControlValue],
  );

  const handleFormChange = React.useCallback(
    (value: any) => {
      if (
        !isUpdatingFromStore &&
        value &&
        !deepEqual(value, lastFormValuesRef.current)
      ) {
        const cleanedValue = Object.fromEntries(
          Object.entries(value).filter(([_key, val]) => {
            if (val === null || val === undefined) return false;
            if (Array.isArray(val) && val.length === 0) return false;
            return true;
          }),
        );

        if (Object.keys(cleanedValue).length > 0) {
          setCurrentFormData(cleanedValue);
          lastFormValuesRef.current = { ...cleanedValue };
        }
      }
    },
    [isUpdatingFromStore, setCurrentFormData, deepEqual],
  );

  // Observar cambios en el formulario con debounce
  React.useEffect(() => {
    const subscription = watch(value => {
      handleFormChange(value);
    });

    return () => subscription.unsubscribe();
  }, [watch, handleFormChange]);

  // Inicializar y evaluar reglas de todos los ítems cuando se carga el componente o cambian los datos
  React.useEffect(() => {
    if (!currentInstrumentItems || currentInstrumentItems.length === 0) {
      return;
    }

    console.log('🔄 Inicializando estados enabled de todos los ítems...');

    // Evaluar cada ítem y actualizar su estado enabled según sus reglas
    currentInstrumentItems.forEach(item => {
      const shouldEnable = evaluateItemRules(item);
      setControlEnabled(item.code, shouldEnable);
    });
  }, [currentInstrumentItems, currentFormData, evaluateItemRules, setControlEnabled]);

  // Si no hay items, mostrar estado vacío
  if (!currentInstrumentItems || currentInstrumentItems.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="document-outline" size={40} color={APP_COLORS.darkGray} />
        <Text style={styles.emptyText}>
          Selecciona un aspecto para ver sus items
        </Text>
      </View>
    );
  }

  // Ordenar items por orden
  const sortedItems = [...currentInstrumentItems].sort(
    (a, b) => a.order - b.order,
  );

  console.log(
    'InstrumentItemsForm - Renderizando',
    sortedItems.length,
    'items ordenados',
  );

  try {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <Icon name="list" size={20} color={APP_COLORS.primary} />
            <Text style={styles.headerTitle}>
              Items del Aspecto ({sortedItems.length})
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}>
          {sortedItems.map((item, index) => {
            return (
              <ItemFormComponent
                key={item.id}
                item={item}
                index={index}
                control={control}
                readonly={readonly}
                onChangeValue={handleItemChange}
              />
            );
          })}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  } catch (error) {
    console.error('Error renderizando InstrumentItemsForm:', error);
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="alert-circle" size={40} color={APP_COLORS.accent} />
          <Text style={styles.emptyText}>
            Error al cargar los items del aspecto
          </Text>
        </View>
      </View>
    );
  }
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: APP_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.lightGray,
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: APP_COLORS.darkGray,
    textAlign: 'center',
  },
});
