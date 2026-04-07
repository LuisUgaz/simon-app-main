import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Sample } from '../../../../../core/entities';
import { useMonitoringStore, useSampleStore } from '../../../../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParams } from '../../../../routes/StackNavigator';
import { BUSINESS_RULES } from '../../../../../core/constants';

const screenWidth = Dimensions.get('window').width;

interface Props {
  sample: Sample;
  autoReport: boolean;
  onDetailPress?: (sample: Sample) => void;
}

export const SampleCard = ({ sample, autoReport, onDetailPress }: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  const { fullName, lastName, firstName, middleName, site } = sample;
  const setSelectedSample = useSampleStore(state => state.setSample);
  const currentMonitoringInstrument = useMonitoringStore(
    state => state.currentMonitoringInstrument,
  );

  const actionHandler = () => {
    sample.autoReport = autoReport;
    setSelectedSample(sample);
    navigation.navigate('SampleDetail');
  };

  // Helper function to determine the color based on visit status
  const getVisitColor = (visitCode: string): string => {
    const visitSample = sample.visits.find(x => x.code === visitCode);

    const visitStatus = BUSINESS_RULES.visitStatusColors.find(
      x => x.status === visitSample?.status,
    );
    return visitStatus ? visitStatus.color : '#f3f4f6';
  };

  return (
    <Pressable style={styles.container} onPress={() => actionHandler()}>
      {/* Header with name and options icon */}
      {lastName && (
        <>
          <View style={styles.header}>
            <Text style={styles.name}>{firstName} {lastName} {middleName}</Text>
            <Pressable onPress={() => onDetailPress && onDetailPress(sample)}>
              <Icon name="ellipsis-horizontal" size={18} color="#666" />
            </Pressable>
          </View>
          <View style={styles.infoRow}>
            <Icon name="business-outline" size={16} color="#666" />
            <Text style={styles.codeText}>
              {site?.code} - {site?.name}
            </Text>
          </View>
        </>
      )}
      {!lastName && (
        <View style={styles.headerWithoutName}>
          <Icon name="business-outline" size={16} color="#666" />
          <Text style={styles.codeText}>
            {site?.code} - {site?.name}
          </Text>
          <Pressable onPress={() => onDetailPress && onDetailPress(sample)}>
            <Icon name="ellipsis-horizontal" size={18} color="#666" />
          </Pressable>
        </View>
      )}

      {/* Auto Report indicator */}
      {autoReport && (
        <View style={styles.autoReportContainer}>
          <Icon name="flash" size={14} color="#fff" />
          <Text style={styles.autoReportText}>Auto Reporte</Text>
        </View>
      )}

      {/* Visits section */}
      <View style={styles.visitsContainer}>
        {currentMonitoringInstrument?.visits.map((visit, index) => (
          <View
            key={index}
            style={[
              styles.visitBox,
              { backgroundColor: getVisitColor(visit.code) },
            ]}>
            <Text style={styles.visitText}>{visit.visitNumber}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth - 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerWithoutName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 30,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  autoReportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  autoReportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  visitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  visitBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
