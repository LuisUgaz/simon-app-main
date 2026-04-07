import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalColors } from '../../../../theme/theme';

interface ProgressBarRowProps {
    label: string;
    count: number;
    total: number;
    color: string;
}

export const ProgressBarRow = ({ label, count, total, color }: ProgressBarRowProps) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.statsContainer}>
                    <Text style={styles.countText}>{count} visitas</Text>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
            </View>
            <View style={styles.progressBackground}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: color
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        color: globalColors.dark,
        fontWeight: '500',
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    countText: {
        fontSize: 12,
        color: globalColors.gray,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: globalColors.dark,
        width: 35,
        textAlign: 'right',
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
});
