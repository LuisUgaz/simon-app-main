import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sample } from '../../../../../core/entities';

interface SampleDetailModalProps {
    visible: boolean;
    sample: Sample | null;
    onClose: () => void;
}

export const SampleDetailModal = ({
    visible,
    sample,
    onClose,
}: SampleDetailModalProps) => {
    if (!sample) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <Text style={modalStyles.title}>Detalle</Text>

                    {/* Row 1: Nombres / Apellidos */}
                    <View style={modalStyles.row}>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>Nombres</Text>
                            <Text style={modalStyles.value}>{sample.firstName}</Text>
                        </View>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>Apellidos</Text>
                            <Text style={modalStyles.value}>
                                {sample.lastName} {sample.middleName}
                            </Text>
                        </View>
                    </View>

                    {/* Row 2: Sede / Código */}
                    <View style={modalStyles.row}>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>Sede</Text>
                            <Text style={modalStyles.value}>{sample.site?.name || '-'}</Text>
                        </View>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>Código</Text>
                            <Text style={modalStyles.value}>{sample.site?.code || '-'}</Text>
                        </View>
                    </View>

                    {/* Row 3: DRE / UGEL */}
                    <View style={modalStyles.row}>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>DRE</Text>
                            <Text style={modalStyles.value}>
                                {sample.dreDescription || '-'}
                            </Text>
                        </View>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>UGEL</Text>
                            <Text style={modalStyles.value}>
                                {sample.ugelDescription || '-'}
                            </Text>
                        </View>
                    </View>

                    {/* Row 4: Nivel educativo / Tipo de muestra */}
                    <View style={[modalStyles.row, modalStyles.lastRow]}>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>Nivel educativo</Text>
                            <Text style={modalStyles.value}>
                                {sample.levelDescription || '-'}
                            </Text>
                        </View>
                        <View style={modalStyles.column}>
                            <Text style={modalStyles.label}>Tipo de muestra</Text>
                            <Text style={modalStyles.value}>
                                {sample.sampleTypeDescription || ''}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <Text style={modalStyles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    lastRow: {
        marginBottom: 24,
    },
    column: {
        flex: 1,
        paddingRight: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: '#666',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});
