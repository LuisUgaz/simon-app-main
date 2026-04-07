import React, {useEffect, useState} from 'react';
import {
  Button,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Formik} from 'formik';
import DatePicker from 'react-native-date-picker';
import Dropdown from 'react-native-input-select';
import Icon from 'react-native-vector-icons/Ionicons';
import {Visit, VisitInstrument} from '../../../../../core/entities';
import {useSampleStore} from '../../../../store/sample.store';
import {useMonitoringStore} from '../../../../store';
import {ENUMS} from '../../../../../core/constants';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import {Loading} from '../../../../components/general/Loading';
import {useAppStore} from '../../../../store/app.store';

interface Props {
  visit: Visit;
  callback?: () => void;
}

export const SampleVisitForm = ({visit, callback}: Props) => {
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openStartTimePicker, setOpenStartTimePicker] = useState(false);
  const [openEndTimePicker, setOpenEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const {clearVisit} = useSampleStore();
  const currentSample = useSampleStore(state => state.sample);
  const currentMonitoringInstrument = useMonitoringStore(
    state => state.currentMonitoringInstrument,
  );
  const {sendAddScheduleVisit} = useMonitoringStore();
  const showSnackbar = useAppStore(state => state.showSnackbar);

  const [initialValues] = useState<Visit>(visit);
  const [visitData, setVisitData] = useState<VisitInstrument>();
  // set times
  const minCurrentTime = new Date();
  const maxCurrentTime = new Date();
  minCurrentTime.setHours(7, 0, 0, 0);
  maxCurrentTime.setHours(23, 59, 0, 0);

  const validationSchema = Yup.object().shape({
    scheduledDate: Yup.date().required('La fecha es obligatoria'),
    startTime: Yup.string().required('La hora de inicio es obligatoria'),
    endTime: Yup.string().required('La hora de fin es obligatoria'),
    type: Yup.string().required('El tipo de visita es obligatorio'),
  });

  useEffect(() => {
    const instrumentVisit = currentMonitoringInstrument?.visits.find(
      x => x.code === visit.code,
    );
    setVisitData(instrumentVisit);
  }, [currentMonitoringInstrument, visit.code]);

  const onSubmit = async (values: Visit) => {
    try {
      setLoading(true);
      values.sampleId = currentSample?.id;
      values.status = ENUMS.configuracion.tipoEstadoVisita.children.programado;
      values.id = null;

      await sendAddScheduleVisit(values);

      showSnackbar('Visita programada exitosamente', 'success');
      clearVisit();
      callback?.();
    } catch (error) {
      showSnackbar('Error al programar la visita', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <ScrollView style={styles.container}>
            {/* Fecha Programada */}
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity
              onPress={() => setOpenDatePicker(true)}
              style={styles.inputContainer}>
              <Text style={styles.inputText}>
                {values.scheduledDate
                  ? dayjs(values.scheduledDate).format('DD/MM/YYYY')
                  : 'Selecciona una fecha'}
              </Text>
              <Icon name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {touched.scheduledDate && errors.scheduledDate && (
              <Text style={styles.errorText}>La fecha es obligatoria</Text>
            )}
            <DatePicker
              modal
              open={openDatePicker}
              date={new Date()}
              confirmText="Confirmar"
              cancelText="Cancelar"
              title="Selecciona una fecha"
              minimumDate={
                visitData?.startDate
                  ? new Date(visitData?.startDate)
                  : new Date()
              }
              maximumDate={
                visitData?.endDate ? new Date(visitData?.endDate!) : new Date()
              }
              mode="date"
              onConfirm={date => {
                setOpenDatePicker(false);
                setFieldValue('scheduledDate', date);
              }}
              onCancel={() => setOpenDatePicker(false)}
            />

            {/* Hora de Inicio */}
            <Text style={styles.label}>Hora de Inicio</Text>
            <TouchableOpacity
              onPress={() => setOpenStartTimePicker(true)}
              style={styles.inputContainer}>
              <Text style={styles.inputText}>
                {values.startTime || 'Selecciona hora de inicio'}
              </Text>
              <Icon name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
            {touched.startTime && errors.startTime && (
              <Text style={styles.errorText}>{errors.startTime}</Text>
            )}
            <DatePicker
              modal
              open={openStartTimePicker}
              date={(() => {
                const defaultDate = dayjs(values.startTime || '07:00', 'HHmm');
                return defaultDate.toDate();
              })()}
              confirmText="Confirmar"
              cancelText="Cancelar"
              title="Selecciona una hora"
              minimumDate={minCurrentTime}
              maximumDate={(() => {
                const defaultDate = dayjs(values.endTime || '23:59', 'HHmm');
                return defaultDate.toDate();
              })()}
              mode="time"
              onConfirm={time => {
                setOpenStartTimePicker(false);
                setFieldValue('startTime', time.toTimeString().slice(0, 5));
              }}
              onCancel={() => setOpenStartTimePicker(false)}
            />

            {/* Hora de Fin */}
            <Text style={styles.label}>Hora Fin</Text>
            <TouchableOpacity
              onPress={() => setOpenEndTimePicker(true)}
              style={styles.inputContainer}>
              <Text style={styles.inputText}>
                {values.endTime || 'Selecciona hora de fin'}
              </Text>
              <Icon name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
            {touched.endTime && errors.endTime && (
              <Text style={styles.errorText}>{errors.endTime}</Text>
            )}
            <DatePicker
              modal
              open={openEndTimePicker}
              confirmText="Confirmar"
              cancelText="Cancelar"
              title="Selecciona una hora"
              date={(() => {
                const defaultDate = dayjs(values.endTime || '23:59', 'HHmm');
                return defaultDate.toDate();
              })()}
              minimumDate={(() => {
                const defaultDate = dayjs(values.startTime || '07:00', 'HHmm');
                return defaultDate.toDate();
              })()}
              maximumDate={maxCurrentTime}
              mode="time"
              onConfirm={time => {
                setOpenEndTimePicker(false);
                setFieldValue('endTime', time.toTimeString().slice(0, 5));
              }}
              onCancel={() => setOpenEndTimePicker(false)}
            />

            {/* Tipo de Visita */}
            <Text style={styles.label}>Tipo de visita</Text>
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
              selectedValue={values.type}
              onValueChange={value => setFieldValue('type', value)}
              primaryColor={'#4d4d4d'}
              dropdownStyle={styles.selector}
              dropdownIconStyle={{right: 15, top: 30}}
            />
            {touched.type && errors.type && (
              <Text style={styles.errorText}>{errors.type}</Text>
            )}
            {/* Dato Adicional */}
            <Text style={styles.label}>Dato adicional</Text>
            <TextInput
              style={[styles.inputContainer, {height: 100}]}
              multiline
              maxLength={300}
              placeholder="Link, teléfono, etc."
              onChangeText={handleChange('comment')}
              onBlur={handleBlur('comment')}
              value={values.comment}
            />
            <Text style={styles.charCount}>{`${
              values.comment?.length || 0
            }/300`}</Text>
            {touched.comment && errors.comment && (
              <Text style={styles.errorText}>{errors.comment}</Text>
            )}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                onPress={() => clearVisit()}
                color="#555"
              />
              <Button
                title="Guardar"
                onPress={() => handleSubmit()}
                color="#007AFF"
              />
            </View>
          </ScrollView>
        )}
      </Formik>

      <Loading visible={loading} message="Guardando visita..." />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  charCount: {
    textAlign: 'right',
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  selector: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});
