import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalColors } from '../../../../theme/theme';

interface StatsRowProps {
    label: string;
    value: number | string;
    color?: string;
    isTotal?: boolean;
}

export const StatsRow = ({ label, value, color, isTotal = false }: StatsRowProps) => {
    return (
        <View style={[styles.container, isTotal && styles.totalContainer]}>
            <View style={styles.labelContainer}>
                {color && <View style={[styles.dot, { backgroundColor: color }]} />}
                <Text style={[styles.label, isTotal && styles.totalText]}>{label}</Text>
            </View>
            <Text style={[styles.value, isTotal && styles.totalText]}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    totalContainer: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        borderBottomWidth: 0,
        paddingTop: 12,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    label: {
        fontSize: 14,
        color: globalColors.gray,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: globalColors.dark,
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: globalColors.dark,
    },
});
