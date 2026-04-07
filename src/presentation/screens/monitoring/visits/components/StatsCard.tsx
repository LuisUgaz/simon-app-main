import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalColors } from '../../../../theme/theme';

interface StatsCardProps {
    title: string;
    children: React.ReactNode;
    icon?: string; // Placeholder for icon name if we were using an icon library
}

export const StatsCard = ({ title, children }: StatsCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: globalColors.white,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: globalColors.dark,
    },
    content: {
        padding: 16,
    },
});
