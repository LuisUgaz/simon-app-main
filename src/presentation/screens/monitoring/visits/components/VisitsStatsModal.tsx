import React, { useEffect, useState, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { globalColors } from '../../../../theme/theme';
import { useAuthStore, useMonitoringStore } from '../../../../store';
import { SummaryCard } from './SummaryCard';
import { ProgressBarRow } from './ProgressBarRow';
import { RoundButton } from '../../../../components';
import { ENUMS } from '../../../../../core/constants';

interface VisitsStatsModalProps {
    visible: boolean;
    onClose: () => void;
}

export const VisitsStatsModal = ({ visible, onClose }: VisitsStatsModalProps) => {
    const { user } = useAuthStore();
    const { getAllOfflineMonitoringData } = useMonitoringStore();
    const [loading, setLoading] = useState(true);
    const [visits, setVisits] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            loadVisits();
        }
    }, [visible]);

    const loadVisits = async () => {
        try {
            setLoading(true);
            const result = await getAllOfflineMonitoringData(user?.documentNumber || '');
            if (result.success && result.data) {
                const visitsData: any[] = [];
                result.data.forEach((monitoringData: any) => {
                    try {
                        const parsedData = JSON.parse(monitoringData.data);
                        visitsData.push(parsedData);
                    } catch (error) {
                        console.error('Error parseando datos de visita:', error);
                    }
                });
                setVisits(visitsData);
            }
        } catch (error) {
            console.error('Error cargando visitas para estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = visits.length;
        let completed = 0;
        const byStatus: Record<string, number> = {};
        const byVisitNumber: Record<string, number> = {};
        const byPlan: Record<string, number> = {};
        const byInstrument: Record<string, number> = {};

        visits.forEach(visit => {
            // Completed
            const aspectCount = visit.aspectsData?.aspects?.length || 0;
            const completedCount = visit.visitAnswerData?.completedAspects?.length || 0;
            if (aspectCount > 0 && completedCount === aspectCount) {
                completed++;
            }

            // Status
            const status = ENUMS.configuracion.tipoEstadoVisita.descriptions[visit.visitAnswerData?.status] || 'Desconocido';
            byStatus[status] = (byStatus[status] || 0) + 1;

            // Visit Number
            const visitNum = visit.visitAnswerData?.visitNumber;
            const visitNumKey = visitNum ? `Visita ${visitNum}` : 'Sin número';
            byVisitNumber[visitNumKey] = (byVisitNumber[visitNumKey] || 0) + 1;

            // Plan
            const plan = visit.monitoringPlanData?.code || 'Sin plan';
            byPlan[plan] = (byPlan[plan] || 0) + 1;

            // Instrument
            const instrument = visit.monitoringInstrumentData?.code || 'Sin instrumento';
            byInstrument[instrument] = (byInstrument[instrument] || 0) + 1;
        });

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            inProgress: total - completed,
            completionRate,
            byStatus,
            byVisitNumber,
            byPlan,
            byInstrument,
        };
    }, [visits]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Estadísticas de Visitas</Text>
                        <RoundButton
                            icon="close"
                            light
                            action={onClose}
                        />
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={globalColors.primary} />
                            <Text style={styles.loadingText}>Calculando estadísticas...</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            {/* Summary Cards Grid */}
                            <View style={styles.gridContainer}>
                                <SummaryCard
                                    title="Total de Visitas"
                                    value={stats.total}
                                    icon="folder-open"
                                    color="#2196F3"
                                />
                                <SummaryCard
                                    title="Completadas"
                                    value={stats.completed}
                                    icon="checkmark-circle"
                                    color={globalColors.green}
                                />
                                <SummaryCard
                                    title="En Progreso"
                                    value={stats.inProgress}
                                    icon="time"
                                    color={globalColors.warning}
                                />
                                <SummaryCard
                                    title="% Completado"
                                    value={`${stats.completionRate}%`}
                                    icon="stats-chart"
                                    color={globalColors.tertiary}
                                />
                            </View>

                            {/* Sections */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Por Estado</Text>
                                {Object.entries(stats.byStatus).map(([status, count], index) => (
                                    <ProgressBarRow
                                        key={status}
                                        label={status}
                                        count={count}
                                        total={stats.total}
                                        color={index % 2 === 0 ? '#2196F3' : globalColors.warning}
                                    />
                                ))}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Por Número de Visita</Text>
                                {Object.entries(stats.byVisitNumber)
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([visitNum, count]) => (
                                        <ProgressBarRow
                                            key={visitNum}
                                            label={visitNum}
                                            count={count}
                                            total={stats.total}
                                            color={globalColors.tertiary}
                                        />
                                    ))}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Por Plan de Monitoreo</Text>
                                {Object.entries(stats.byPlan).map(([plan, count]) => (
                                    <ProgressBarRow
                                        key={plan}
                                        label={plan}
                                        count={count}
                                        total={stats.total}
                                        color="#E91E63"
                                    />
                                ))}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Por Instrumento</Text>
                                {Object.entries(stats.byInstrument).map(([instrument, count]) => (
                                    <ProgressBarRow
                                        key={instrument}
                                        label={instrument}
                                        count={count}
                                        total={stats.total}
                                        color="#9C27B0"
                                    />
                                ))}
                            </View>

                            <View style={styles.footerSpacer} />
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: globalColors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: globalColors.dark,
    },
    scrollView: {
        padding: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
        backgroundColor: globalColors.white,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: globalColors.dark,
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: globalColors.gray,
        fontSize: 16,
    },
    footerSpacer: {
        height: 40,
    },
});
