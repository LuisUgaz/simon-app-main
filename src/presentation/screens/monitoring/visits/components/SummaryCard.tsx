import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalColors } from '../../../../theme/theme';

interface SummaryCardProps {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    backgroundColor?: string;
}

export const SummaryCard = ({ title, value, icon, color, backgroundColor }: SummaryCardProps) => {
    return (
        <View style={[styles.container, { borderLeftColor: color }]}>
            <View style={[styles.iconContainer, { backgroundColor: backgroundColor || `${color}20` }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.value, { color }]}>{value}</Text>
                <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        backgroundColor: globalColors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 3,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    title: {
        fontSize: 12,
        color: globalColors.gray,
        fontWeight: '500',
    },
});
