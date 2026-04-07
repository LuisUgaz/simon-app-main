import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
  Pressable,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Dropdown from 'react-native-input-select';
import { TSelectedItem } from 'react-native-input-select/lib/typescript/src/types/index.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { RoundButton } from '../../../components';
import { InstrumentInfoModal } from './components/InstrumentInfoModal';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParams } from '../../../routes/StackNavigator';
import { useMonitoringStore, useSampleStore } from '../../../store';
import { globalColors } from '../../../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const SampleVisitScreen = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const currentMonitoringInstrument = useMonitoringStore(
    state => state.currentMonitoringInstrument,
  );
  const currentSample = useSampleStore(state => state.sample);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [formValues, setFormValues] = useState<any>({
    question1: '',
    question2: [],
    question3: '',
    question4: '',
    question5: '',
    question6: new Date(),
    question7: '',
    question8: '',
    question9: '',
    question10: '',
  });

  const handleDropdownChange = (
    key: string,
    value: string | number | boolean | TSelectedItem[] | undefined,
  ) => {
    setFormValues((prev: any) => ({ ...prev, [key]: value }));
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleInfoPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={{ ...styles.header, paddingTop: top }}>
        <View style={styles.buttons}>
          <RoundButton icon="arrow-back" light action={() => goBack()} />
          <View style={styles.rightSection}>
            <View style={styles.labelHeader}>
              <Text style={styles.labelText}>
                Inst.: {currentMonitoringInstrument?.code}
              </Text>
            </View>
            <Pressable style={styles.infoButton} onPress={handleInfoPress}>
              <Ionicons name="information-circle-outline" size={24} color="#494949" />
            </Pressable>
          </View>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>{currentSample?.fullName}</Text>
          <Text style={styles.subtitle}>
            {currentSample?.site?.code} - {currentSample?.site?.name} (Visita
            01)
          </Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        {/* Pregunta 1: Texto simple */}
        <Text style={styles.label}>1. Nombre del responsable:</Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="Escribe el nombre"
          value={formValues.question1}
          onChangeText={text =>
            setFormValues((prev: any) => ({ ...prev, question1: text }))
          }
        />

        {/* Pregunta 2: Selección múltiple */}
        <Text style={styles.label}>
          2. Selecciona los elementos disponibles:
        </Text>
        {['Elemento A', 'Elemento B', 'Elemento C'].map(option => (
          <TouchableOpacity
            key={option}
            style={
              formValues.question2.includes(option)
                ? [styles.option, styles.selectedOption]
                : styles.option
            }
          // onPress={() => {
          //   const isSelected = formValues.question2.includes(option);
          //   setFormValues(prev => ({
          //     ...prev,
          //     question2: isSelected
          //       ? prev.question2.filter(item => item !== option)
          //       : [...prev.question2, option],
          //   }));
          // }}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        {/* Pregunta 3: Dropdown */}
        <Text style={styles.label}>3. Estado del proyecto:</Text>
        <Dropdown
          placeholder="Seleccione una opción"
          options={[
            { label: 'En progreso', value: 'En progreso' },
            { label: 'Completado', value: 'Completado' },
            { label: 'Pendiente', value: 'Pendiente' },
          ]}
          selectedValue={formValues.question3}
          onValueChange={value => handleDropdownChange('question3', value)}
          primaryColor={'#4d4d4d'}
        />

        {/* Pregunta 4: Fecha */}
        <Text style={styles.label}>4. Fecha de revisión:</Text>
        <TouchableOpacity
          onPress={() => setOpenDatePicker(true)}
          style={styles.inputContainer}>
          <Text style={styles.inputText}>'Selecciona una fecha'</Text>
          <Icon name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
        <DatePicker
          modal
          confirmText="Confirmar"
          cancelText="Cancelar"
          title="Selecciona una fecha"
          open={openDatePicker}
          date={formValues.question6 || new Date()}
          mode="date"
          onConfirm={date => {
            setOpenDatePicker(false);
            setFormValues((prev: any) => ({ ...prev, question6: date }));
          }}
          onCancel={() => setOpenDatePicker(false)}
        />

        {/* Pregunta 5: Texto largo */}
        <Text style={styles.label}>5. Observaciones:</Text>
        <TextInput
          style={[styles.inputContainer, styles.textArea]}
          multiline
          placeholder="Escribe tus comentarios"
          value={formValues.question5}
          onChangeText={text =>
            setFormValues((prev: any) => ({ ...prev, question5: text }))
          }
        />

        {/* Pregunta 6: Selección única con botones */}
        <Text style={styles.label}>6. ¿El equipo está completo?</Text>
        {['Sí', 'No'].map(option => (
          <TouchableOpacity
            key={option}
            style={
              formValues.question7 === option
                ? [styles.option, styles.selectedOption]
                : styles.option
            }
            onPress={() =>
              setFormValues((prev: any) => ({ ...prev, question7: option }))
            }>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        {/* Pregunta 7: Dropdown */}
        <Text style={styles.label}>7. Nivel de satisfacción:</Text>
        <Dropdown
          placeholder="Seleccione un nivel"
          options={[
            { label: 'Muy satisfecho', value: 'Muy satisfecho' },
            { label: 'Satisfecho', value: 'Satisfecho' },
            { label: 'Insatisfecho', value: 'Insatisfecho' },
          ]}
          selectedValue={formValues.question8}
          onValueChange={value => handleDropdownChange('question8', value)}
          primaryColor={'#4d4d4d'}
        />

        {/* Pregunta 8: Fecha */}
        <Text style={styles.label}>8. Fecha estimada de entrega:</Text>
        <TouchableOpacity
          onPress={() => setOpenDatePicker(true)}
          style={styles.inputContainer}>
          <Text style={styles.inputText}>'Selecciona una fecha'</Text>
          <Icon name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
        <DatePicker
          modal
          confirmText="Confirmar"
          cancelText="Cancelar"
          title="Selecciona una fecha"
          open={openDatePicker}
          date={new Date()}
          mode="date"
          onConfirm={date => {
            setOpenDatePicker(false);
            setFormValues((prev: any) => ({ ...prev, question9: date }));
          }}
          onCancel={() => setOpenDatePicker(false)}
        />

        {/* Pregunta 9: Selección única con botones */}
        <Text style={styles.label}>9. ¿Hubo algún retraso?</Text>
        {['Sí', 'No'].map(option => (
          <TouchableOpacity
            key={option}
            style={
              formValues.question10 === option
                ? [styles.option, styles.selectedOption]
                : styles.option
            }
            onPress={() =>
              setFormValues((prev: any) => ({ ...prev, question10: option }))
            }>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        {/* Botón para enviar */}
        <View>
          <Button title="Enviar" onPress={() => console.log(formValues)} />
        </View>
      </ScrollView>

      <InstrumentInfoModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        instrument={currentMonitoringInstrument || null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: globalColors.background,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelHeader: {
    backgroundColor: '#4d4d4d',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  labelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titles: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    color: globalColors.dark,
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: globalColors.gray,
    fontSize: 18,
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
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#4d4d4d',
  },
  selectedOption: {
    backgroundColor: '#4caf50',
  },
  optionText: {
    color: '#fff',
    textAlign: 'center',
  },
  textArea: {
    height: 100,
  },
});
