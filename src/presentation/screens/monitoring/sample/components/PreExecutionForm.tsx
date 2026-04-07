import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useMonitoringStore, useSampleStore} from '../../../../store';
import {useAuthStore} from '../../../../store/auth.store';
import {ENUMS} from '../../../../../core/constants';
import DatePicker from 'react-native-date-picker';
import Dropdown from 'react-native-input-select';
import {useAppStore} from '../../../../store/app.store';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import {VisitAnswer} from '../../../../../core/entities';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParams} from '../../../../routes/StackNavigator';

interface PreExecutionFormProps {
  onComplete: (visitUpdated: boolean) => void;
  handleSaveToLocal: () => void;
  goBack: () => void;
  currentVisitAnswer?: VisitAnswer;
}

export const PreExecutionForm: React.FC<PreExecutionFormProps> = ({
  onComplete,
  handleSaveToLocal,
  goBack,
  currentVisitAnswer,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const showSnackbar = useAppStore(state => state.showSnackbar);
  const user = useAuthStore(state => state.user);
  const {
    sendUpdateVisit,
    updatePreExecutionData,
    updateVisitAnswerDataFromPreExecution,
    getOfflineMonitoringData,
  } = useMonitoringStore();
  const {sample} = useSampleStore();
  const isOffLine = useAuthStore(state => state.isOffLine);
  // Estados del formulario
  const [subjectFound, setSubjectFound] = useState<boolean | null>(null);
  const [withReplacement, setWithReplacement] = useState<boolean | null>(null);
  const [auxiliaryData, setAuxiliaryData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
  });
  const [isExecutionAdjustment, setIsExecutionAdjustment] = useState<
    boolean | null
  >(null);
  const [executionData, setExecutionData] = useState({
    startDate: new Date(),
    startTime: '07:00',
    endDate: new Date(),
    endTime: '23:59',
  });
  const [isRescheduled, setIsRescheduled] = useState<boolean | null>(null);
  const [reschedulingData, setReschedulingData] = useState({
    date: new Date(),
    startTime: '07:00',
    endTime: '23:59',
    visitType: ENUMS.configuracion.tipoVisita.children.presencial as string,
    additionalData: '',
  });
  const [observation, setObservation] = useState('');

  // Ref para controlar la carga inicial de datos desde SQLite
  const isLoadingFromSQLiteRef = useRef(false);

  // Estados para DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState<string>('');

  // Reset auxiliar data
  const resetAuxiliaryData = () => {
    setAuxiliaryData({
      firstName: '',
      lastName: '',
      middleName: '',
    });
  };

  // Reset execution data
  const resetExecutionData = () => {
    setExecutionData({
      startDate: new Date(),
      startTime: '07:00',
      endDate: new Date(),
      endTime: '23:59',
    });
  };

  // Reset rescheduling data
  const resetReschedulingData = () => {
    setReschedulingData({
      date: new Date(),
      startTime: '07:00',
      endTime: '23:59',
      visitType: ENUMS.configuracion.tipoVisita.children.presencial as string,
      additionalData: '',
    });
  };

  // Reset observation data
  const resetObservation = () => {
    setObservation('');
  };

  // Verificar si se puede mostrar cada sección según las condiciones
  const shouldShowWithReplacement = subjectFound === false;
  const shouldShowAuxiliaryData = withReplacement === true;
  // Solo mostrar ajuste de ejecución si se encontró al docente o hay representante
  const shouldShowExecutionAdjustment =
    subjectFound === true ||
    (subjectFound === false && withReplacement === true);

  const shouldShowExecutionData = isExecutionAdjustment === true;

  // Solo mostrar reprogramación si no se encontró al docente y no hay representante
  const shouldShowRescheduled =
    subjectFound === false && withReplacement === false;

  const shouldShowReschedulingData = isRescheduled === true;

  // Mostrar observación solo cuando estamos en el caso NO NO NO (o en el proceso)
  const shouldShowObservation =
    subjectFound === false &&
    withReplacement === false &&
    isRescheduled !== null;

  // Verificar si se cumple alguna condición de "Culminada sin ejecución"
  const isCompletedWithoutExecution =
    subjectFound === false &&
    withReplacement === false &&
    isRescheduled === false;

  // Efecto para restablecer estados dependientes cuando cambia si se encontró al docente
  useEffect(() => {
    if (subjectFound !== null && !isLoadingFromSQLiteRef.current) {
      // Reiniciar todos los estados que dependen de esta condición
      setWithReplacement(null);
      setIsExecutionAdjustment(null);
      setIsRescheduled(null);

      // Reiniciar datos de formularios ocultos
      resetAuxiliaryData();
      resetExecutionData();
      resetReschedulingData();
      resetObservation();
    }
  }, [subjectFound]);

  // Efecto para restablecer estados cuando cambia si hay representante
  useEffect(() => {
    if (withReplacement !== null && !isLoadingFromSQLiteRef.current) {
      // Reiniciar estados que dependen de esta condición
      setIsExecutionAdjustment(null);
      setIsRescheduled(null);

      // Reiniciar datos de formularios ocultos
      if (withReplacement === true) {
        resetReschedulingData();
        resetObservation();
      } else {
        resetAuxiliaryData();
      }

      resetExecutionData();
    }
  }, [withReplacement]);

  // Efecto para resetear datos cuando cambia si es un instrumento ya ejecutado
  useEffect(() => {
    if (isExecutionAdjustment !== null && !isLoadingFromSQLiteRef.current) {
      // Si cambia esta condición, resetear la reprogramación completamente
      setIsRescheduled(null);
      resetReschedulingData();

      if (isExecutionAdjustment === false) {
        // Si no es instrumento ya ejecutado, resetear datos de ejecución
        resetExecutionData();
      }
    }
  }, [isExecutionAdjustment]);

  // Efecto para resetear datos de reprogramación cuando cambia si quiere reprogramar
  useEffect(() => {
    if (isRescheduled === false && !isLoadingFromSQLiteRef.current) {
      // Si no quiere reprogramar, limpiar los datos de reprogramación
      resetReschedulingData();
    }
  }, [isRescheduled]);

  // Efecto para cargar datos de pre-ejecución desde SQLite si la visita está en estado programado
  useEffect(() => {
    const loadPreExecutionData = async () => {
      if (
        currentVisitAnswer?.status ===
          ENUMS.configuracion.tipoEstadoVisita.children.programado &&
        sample?.id &&
        currentVisitAnswer?.id &&
        !isLoadingFromSQLiteRef.current
      ) {
        try {
          console.log(
            '🔄 Cargando preExecutionData desde SQLite para visita programada:',
            {
              sampleId: sample.id,
              visitAnswerId: currentVisitAnswer.id,
            },
          );

          // Activar flag de carga para evitar que los useEffect de limpieza interfieran
          isLoadingFromSQLiteRef.current = true;

          const response = await getOfflineMonitoringData(
            sample.id,
            currentVisitAnswer.id,
          );

          if (
            response.success &&
            response.data?.visitAnswerData?.preExecutionData
          ) {
            const preExecutionData =
              response.data.visitAnswerData.preExecutionData;
            console.log(
              '✅ Datos de pre-ejecución cargados desde SQLite:',
              preExecutionData,
            );

            // Cargar todos los datos de manera secuencial para respetar las dependencias
            // 1. Primero los datos principales
            if (preExecutionData.subjectFound !== undefined) {
              setSubjectFound(preExecutionData.subjectFound);
            }

            // 2. Esperar un tick para que se procese el primer setState
            await new Promise(resolve => setTimeout(resolve, 0));

            if (preExecutionData.withReplacement !== undefined) {
              setWithReplacement(preExecutionData.withReplacement);
            }

            // 3. Esperar otro tick
            await new Promise(resolve => setTimeout(resolve, 0));

            if (preExecutionData.isExecutionAdjustment !== undefined) {
              setIsExecutionAdjustment(preExecutionData.isExecutionAdjustment);
            }

            // 4. Esperar otro tick
            await new Promise(resolve => setTimeout(resolve, 0));

            if (preExecutionData.isRescheduled !== undefined) {
              setIsRescheduled(preExecutionData.isRescheduled);
            }

            // 5. Cargar datos auxiliares
            if (
              preExecutionData.auxiliaryFirstName ||
              preExecutionData.auxiliaryLastName ||
              preExecutionData.auxiliaryMiddleName
            ) {
              setAuxiliaryData({
                firstName: preExecutionData.auxiliaryFirstName || '',
                lastName: preExecutionData.auxiliaryLastName || '',
                middleName: preExecutionData.auxiliaryMiddleName || '',
              });
            }

            // 6. Cargar datos de ejecución
            if (
              preExecutionData.executionStartDate ||
              preExecutionData.executionStartTime ||
              preExecutionData.executionEndDate ||
              preExecutionData.executionEndTime
            ) {
              setExecutionData({
                startDate: preExecutionData.executionStartDate
                  ? new Date(preExecutionData.executionStartDate)
                  : new Date(),
                startTime: preExecutionData.executionStartTime || '07:00',
                endDate: preExecutionData.executionEndDate
                  ? new Date(preExecutionData.executionEndDate)
                  : new Date(),
                endTime: preExecutionData.executionEndTime || '23:59',
              });
            }

            // 7. Cargar datos de reprogramación
            if (
              preExecutionData.scheduledDate ||
              preExecutionData.startTime ||
              preExecutionData.endTime ||
              preExecutionData.visitType ||
              preExecutionData.additionalData
            ) {
              setReschedulingData({
                date: preExecutionData.scheduledDate
                  ? new Date(preExecutionData.scheduledDate)
                  : new Date(),
                startTime: preExecutionData.startTime || '07:00',
                endTime: preExecutionData.endTime || '23:59',
                visitType:
                  preExecutionData.visitType ||
                  (ENUMS.configuracion.tipoVisita.children
                    .presencial as string),
                additionalData: preExecutionData.additionalData || '',
              });
            }

            // 8. Cargar observación
            if (preExecutionData.observation) {
              setObservation(preExecutionData.observation);
            }

            console.log(
              '✅ Formulario cargado con datos de pre-ejecución existentes',
            );
          } else {
            console.log(
              'ℹ️ No se encontraron datos de pre-ejecución en SQLite para esta visita',
            );
          }
        } catch (error) {
          console.error(
            '❌ Error cargando datos de pre-ejecución desde SQLite:',
            error,
          );
        } finally {
          // Desactivar flag de carga después de un pequeño delay
          setTimeout(() => {
            isLoadingFromSQLiteRef.current = false;
          }, 100);
        }
      }
    };

    loadPreExecutionData();
  }, [
    currentVisitAnswer?.status,
    sample?.id,
    currentVisitAnswer?.id,
    getOfflineMonitoringData,
  ]);

  // Mostrar DatePicker
  const openDatePicker = (fieldName: string) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

  // Mostrar TimePicker
  const openTimePicker = (fieldName: string) => {
    setCurrentTimeField(fieldName);
    setShowTimePicker(true);
  };

  // Manejar selección de fecha
  const handleDateSelected = (date: Date) => {
    setShowDatePicker(false);
    switch (currentDateField) {
      case 'executionStartDate':
        setExecutionData({...executionData, startDate: date});
        break;
      case 'executionEndDate':
        setExecutionData({...executionData, endDate: date});
        break;
      case 'reschedulingDate':
        setReschedulingData({...reschedulingData, date});
        break;
    }
  };

  // Manejar selección de hora
  const handleTimeSelected = (date: Date) => {
    setShowTimePicker(false);
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    switch (currentTimeField) {
      case 'executionStartTime':
        setExecutionData({...executionData, startTime: formattedTime});
        break;
      case 'executionEndTime':
        setExecutionData({...executionData, endTime: formattedTime});
        break;
      case 'reschedulingStartTime':
        setReschedulingData({...reschedulingData, startTime: formattedTime});
        break;
      case 'reschedulingEndTime':
        setReschedulingData({...reschedulingData, endTime: formattedTime});
        break;
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    goBack();
  };

  // Función auxiliar para mostrar el objeto que se enviará al backend
  const getVisitDataToSend = (): Partial<VisitAnswer> => {
    // Crear objeto base con las propiedades comunes

    const visitData: Partial<VisitAnswer> = {
      ...(currentVisitAnswer || {}),
      subjectFound: !!subjectFound,
      withReplacement: !!withReplacement,
      isRescheduled: !!isRescheduled,
      isExecutionAdjustment: !!isExecutionAdjustment,
      observation: observation,
      // monitorType: sample?.monitorType,
      monitorType: sample?.monitorType,
      monitorTypeDescription: sample?.monitorTypeDescription,
      monitorDocumentType: sample?.monitorDocumentType,
      monitorDocumentNumber: sample?.monitorDocumentNumber,
      monitorFirstName: sample?.monitorFirstName,
      monitorLastName: sample?.monitorLastName,
      monitorMiddleName: sample?.monitorMiddleName,
      monitorSite: sample?.monitorSite,
      visitType: sample?.visitType,
      visitTypeDescription: sample?.visitTypeDescription,
    };

    // Actualizar estado según condiciones (similar a fnAction en Angular)
    if (subjectFound === true) {
      // PutUpdateInicioEjecucionSimple
      visitData.status =
        ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion;
      visitData.withReplacement = false;
      visitData.isRescheduled = false;

      // Solo incluir datos de ejecución si es un instrumento ya ejecutado
      if (isExecutionAdjustment === true) {
        visitData.executionStartDate = executionData.startDate;
        visitData.executionStartTime = executionData.startTime;
        visitData.executionEndDate = executionData.endDate;
        visitData.executionEndTime = executionData.endTime;
      }
    } else if (subjectFound === false && withReplacement === true) {
      // PutUpdateInicioEjecucionConRepresentante
      visitData.status =
        ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion;
      visitData.isRescheduled = false;
      visitData.auxiliaryFirstName = auxiliaryData.firstName;
      visitData.auxiliaryLastName = auxiliaryData.lastName;
      visitData.auxiliaryMiddleName = auxiliaryData.middleName;

      // Solo incluir datos de ejecución si es un instrumento ya ejecutado
      if (isExecutionAdjustment === true) {
        visitData.executionStartDate = executionData.startDate;
        visitData.executionStartTime = executionData.startTime;
        visitData.executionEndDate = executionData.endDate;
        visitData.executionEndTime = executionData.endTime;
      }
    } else if (
      subjectFound === false &&
      withReplacement === false &&
      isRescheduled === true
    ) {
      // PutUpdateReprogramacion
      visitData.isExecutionAdjustment = false;
      visitData.scheduledDate = reschedulingData.date;
      visitData.startTime = reschedulingData.startTime;
      visitData.endTime = reschedulingData.endTime;
      visitData.additionalData = reschedulingData.additionalData;
      visitData.visitType = reschedulingData.visitType;
    } else if (
      subjectFound === false &&
      withReplacement === false &&
      isRescheduled === false
    ) {
      // PutUpdateCulminadaSinEjecucion
      visitData.status =
        ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion;
      visitData.isExecutionAdjustment = false;
    }

    return visitData;
  };

  const savePreExecutionData = async () => {
    const visitData = getVisitDataToSend();
    try {
      if (sample?.id && currentVisitAnswer?.id) {
        const responseLocal = await updatePreExecutionData(
          user?.documentNumber || '',
          sample.id,
          currentVisitAnswer.id,
          visitData,
        );

        if (isOffLine) {
          // Modo offline: guardar preExecutionData en el objeto existente
          if (responseLocal.success) {
            await updateVisitAnswerDataFromPreExecution(
              user?.documentNumber || '',
              sample?.id || '',
              currentVisitAnswer?.id || '',
              true,
            );

            // Si el estado es "en ejecución", navegar al formulario de visita
            if (
              visitData.status ===
              ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion
            ) {
              navigation.navigate('SampleVisitForm' as never);
            } else {
              onComplete(true);
              goBack();
            }
          } else {
            showSnackbar(
              responseLocal.message || 'Error al guardar preExecutionData',
              'error',
            );
            onComplete(false);
          }
        }
      } else {
        showSnackbar(
          'No se encontraron datos de sample o visita para guardar offline',
          'error',
        );
        onComplete(false);
      }
    } catch (error) {
      await handleSaveToLocal();
      await savePreExecutionData();
    }
  };

  // Manejar guardar (basado en fnAction del componente Angular de referencia)
  const handleSave = async () => {
    await savePreExecutionData();
    if (isOffLine) {
      return false;
    }

    try {
      const visitData = getVisitDataToSend();
      // Modo online: llamar al servicio para actualizar la visita
      if (sendUpdateVisit) {
        const response = await sendUpdateVisit(visitData as VisitAnswer);

        if (response.success) {
          showSnackbar('Visita actualizada correctamente', 'success');
          await updateVisitAnswerDataFromPreExecution(
            user?.documentNumber || '',
            sample?.id || '',
            currentVisitAnswer?.id || '',
            false,
          );
          // Si el estado es "en ejecución", navegar al formulario de visita
          if (
            visitData.status ===
            ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion
          ) {
            navigation.navigate('SampleVisitForm' as never);
          } else {
            onComplete(true);
            goBack();
          }
        } else {
          showSnackbar(
            response.message || 'Error al actualizar la visita',
            'error',
          );
          onComplete(false);
        }
      } else {
        showSnackbar('Servicio de actualización no disponible', 'warning');
        onComplete(false);
      }
    } catch (error) {
      console.error('Error al guardar la visita:', error);
      showSnackbar('Error al guardar la visita', 'error');
      onComplete(false);
    }
  };

  // Determinar qué botón mostrar según las condiciones
  const renderActionButton = () => {
    if (
      (subjectFound === true && isExecutionAdjustment !== null) ||
      (subjectFound === false &&
        withReplacement === true &&
        isExecutionAdjustment !== null)
    ) {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Iniciar ejecución</Text>
        </TouchableOpacity>
      );
    } else if (
      subjectFound === false &&
      withReplacement === false &&
      isRescheduled !== null
    ) {
      return (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Pre ejecución de visita</Text>
        </View>

        {/* Alerta cuando se va a marcar "Culminada sin ejecución" */}
        {isCompletedWithoutExecution && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Recuerda:</Text>
            <Text style={styles.warningText}>
              Al no haberse encontrado presente el/la DOCENTE, no haber estado
              algún representante y no reprogramar, la visita será registrada
              como{' '}
              <Text style={styles.boldText}>"Culminada sin ejecución"</Text>.
            </Text>
          </View>
        )}

        {/* ¿Se encontró el/la DOCENTE? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Se encontró el/la DOCENTE? *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                subjectFound === true && styles.radioButtonSelected,
              ]}
              onPress={() => setSubjectFound(true)}>
              <Text
                style={[
                  styles.radioText,
                  subjectFound === true && styles.radioTextSelected,
                ]}>
                SI
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                subjectFound === false && styles.radioButtonSelected,
              ]}
              onPress={() => setSubjectFound(false)}>
              <Text
                style={[
                  styles.radioText,
                  subjectFound === false && styles.radioTextSelected,
                ]}>
                NO
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ¿Alguien brindó información para la ejecución? */}
        {shouldShowWithReplacement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ¿Alguien brindó información para la ejecución del instrumento en
              representación de el/la DOCENTE? *
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  withReplacement === true && styles.radioButtonSelected,
                ]}
                onPress={() => setWithReplacement(true)}>
                <Text
                  style={[
                    styles.radioText,
                    withReplacement === true && styles.radioTextSelected,
                  ]}>
                  SI
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  withReplacement === false && styles.radioButtonSelected,
                ]}
                onPress={() => setWithReplacement(false)}>
                <Text
                  style={[
                    styles.radioText,
                    withReplacement === false && styles.radioTextSelected,
                  ]}>
                  NO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Datos del representante */}
        {shouldShowAuxiliaryData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Datos de el/la representante*
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombres</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombres"
                  value={auxiliaryData.firstName}
                  onChangeText={text =>
                    setAuxiliaryData({...auxiliaryData, firstName: text})
                  }
                  maxLength={50}
                />
                <Text style={styles.charCount}>
                  {auxiliaryData.firstName.length}/50
                </Text>
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Primer apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Primer apellido"
                  value={auxiliaryData.lastName}
                  onChangeText={text =>
                    setAuxiliaryData({...auxiliaryData, lastName: text})
                  }
                  maxLength={50}
                />
                <Text style={styles.charCount}>
                  {auxiliaryData.lastName.length}/50
                </Text>
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Segundo apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Segundo apellido"
                  value={auxiliaryData.middleName}
                  onChangeText={text =>
                    setAuxiliaryData({...auxiliaryData, middleName: text})
                  }
                  maxLength={50}
                />
                <Text style={styles.charCount}>
                  {auxiliaryData.middleName.length}/50
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ¿Es ingreso de datos de un instrumento ya ejecutado? */}
        {shouldShowExecutionAdjustment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ¿Es ingreso de datos de un instrumento ya ejecutado? *
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  isExecutionAdjustment === true && styles.radioButtonSelected,
                ]}
                onPress={() => setIsExecutionAdjustment(true)}>
                <Text
                  style={[
                    styles.radioText,
                    isExecutionAdjustment === true && styles.radioTextSelected,
                  ]}>
                  SI
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  isExecutionAdjustment === false && styles.radioButtonSelected,
                ]}
                onPress={() => setIsExecutionAdjustment(false)}>
                <Text
                  style={[
                    styles.radioText,
                    isExecutionAdjustment === false && styles.radioTextSelected,
                  ]}>
                  NO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Datos de la ejecución */}
        {shouldShowExecutionData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos de la ejecución*</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha inicio</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openDatePicker('executionStartDate')}>
                  <Text style={styles.dateText}>
                    {dayjs(executionData.startDate).format('DD/MM/YYYY')}
                  </Text>
                  <Icon name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hora de inicio</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openTimePicker('executionStartTime')}>
                  <Text style={styles.dateText}>{executionData.startTime}</Text>
                  <Icon name="time-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha de cierre</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openDatePicker('executionEndDate')}>
                  <Text style={styles.dateText}>
                    {dayjs(executionData.endDate).format('DD/MM/YYYY')}
                  </Text>
                  <Icon name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hora de cierre</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openTimePicker('executionEndTime')}>
                  <Text style={styles.dateText}>{executionData.endTime}</Text>
                  <Icon name="time-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ¿Deseas reprogramar la visita? */}
        {shouldShowRescheduled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ¿Deseas reprogramar la visita? *
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  isRescheduled === true && styles.radioButtonSelected,
                ]}
                onPress={() => setIsRescheduled(true)}>
                <Text
                  style={[
                    styles.radioText,
                    isRescheduled === true && styles.radioTextSelected,
                  ]}>
                  SI
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  isRescheduled === false && styles.radioButtonSelected,
                ]}
                onPress={() => setIsRescheduled(false)}>
                <Text
                  style={[
                    styles.radioText,
                    isRescheduled === false && styles.radioTextSelected,
                  ]}>
                  NO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Datos de reprogramación - ocultar si el docente fue encontrado o es instrumento ya ejecutado */}
        {shouldShowReschedulingData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos de reprogramación*</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openDatePicker('reschedulingDate')}>
                  <Text style={styles.dateText}>
                    {dayjs(reschedulingData.date).format('DD/MM/YYYY')}
                  </Text>
                  <Icon name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hora de inicio</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openTimePicker('reschedulingStartTime')}>
                  <Text style={styles.dateText}>
                    {reschedulingData.startTime}
                  </Text>
                  <Icon name="time-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hora fin</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openTimePicker('reschedulingEndTime')}>
                  <Text style={styles.dateText}>
                    {reschedulingData.endTime}
                  </Text>
                  <Icon name="time-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de visita</Text>
                <Dropdown
                  placeholder="Selecciona una opción..."
                  options={[
                    {
                      label: 'Presencial',
                      value: ENUMS.configuracion.tipoVisita.children.presencial,
                    },
                    {
                      label: 'Telefónico',
                      value: ENUMS.configuracion.tipoVisita.children.telefonico,
                    },
                    {
                      label: 'Virtual',
                      value: ENUMS.configuracion.tipoVisita.children.virtual,
                    },
                  ]}
                  selectedValue={reschedulingData.visitType}
                  onValueChange={(value: any) =>
                    setReschedulingData({
                      ...reschedulingData,
                      visitType: value as string,
                    })
                  }
                  primaryColor={'#4d4d4d'}
                  dropdownStyle={styles.dropdown}
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Dato adicional (link, n° telefóno, etc)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Link, teléfono, etc."
                  value={reschedulingData.additionalData}
                  onChangeText={text =>
                    setReschedulingData({
                      ...reschedulingData,
                      additionalData: text,
                    })
                  }
                  maxLength={300}
                />
                <Text style={styles.charCount}>
                  {reschedulingData.additionalData.length}/300
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Observación - se muestra cuando estamos en el camino de NO NO NO */}
        {shouldShowObservation && (
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Observación</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ingrese su observación"
              value={observation}
              onChangeText={setObservation}
              multiline={true}
              numberOfLines={4}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{observation.length}/1000</Text>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          {renderActionButton()}
        </View>
      </ScrollView>

      {/* DatePicker Modal */}
      <DatePicker
        modal
        confirmText="Confirmar"
        cancelText="Cancelar"
        title="Selecciona una fecha"
        open={showDatePicker}
        date={new Date()}
        mode="date"
        onConfirm={handleDateSelected}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* TimePicker Modal */}
      <DatePicker
        modal
        confirmText="Confirmar"
        cancelText="Cancelar"
        title="Selecciona una hora"
        open={showTimePicker}
        date={new Date()}
        mode="time"
        onConfirm={handleTimeSelected}
        onCancel={() => setShowTimePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeeba',
    padding: 16,
    marginBottom: 16,
    borderRadius: 4,
  },
  warningTitle: {
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  warningText: {
    color: '#856404',
  },
  boldText: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  radioButtonSelected: {
    backgroundColor: '#4d4d4d',
    borderColor: '#4d4d4d',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  radioTextSelected: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 8,
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 150,
  },
  secondaryButton: {
    backgroundColor: '#4d4d4d',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
