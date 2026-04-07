import React, {useState, useImperativeHandle, forwardRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {VisitAnswer} from '../../../../../core/entities';

// Paleta de colores de la aplicación
const APP_COLORS = {
  primary: '#bf0909', // Rojo principal
  secondary: '#494949', // Gris oscuro
  accent: '#75a25d', // Verde acento
  background: '#f5f5f5', // Gris claro de fondo
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
  success: '#75a25d',
  info: '#17a2b8',
};

interface ObservationsCommitmentsEditorProps {
  visitAnswer?: VisitAnswer;
  onSave: (observation: string, commitments: string[]) => void;
  onEditingObservationsChange?: (isEditing: boolean) => void;
  readonly?: boolean;
}

export interface ObservationsCommitmentsEditorRef {
  cancelEditing: () => void;
}

export const ObservationsCommitmentsEditor = forwardRef<
  ObservationsCommitmentsEditorRef,
  ObservationsCommitmentsEditorProps
>(({ visitAnswer, onSave, onEditingObservationsChange, readonly = false }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [observation, setObservation] = useState(visitAnswer?.observation || '');
  const [commitments, setCommitments] = useState<string[]>(visitAnswer?.commitments || []);
  const [newCommitment, setNewCommitment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Función para manejar cambios en el estado de edición
  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    onEditingObservationsChange?.(editing);
  };

  const addCommitment = () => {
    if (newCommitment.trim()) {
      setCommitments([...commitments, newCommitment.trim()]);
      setNewCommitment('');
    }
  };

  const removeCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index));
  };

  const editCommitment = (index: number, newText: string) => {
    const updated = [...commitments];
    updated[index] = newText;
    setCommitments(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(observation, commitments);
      handleEditingChange(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la información');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setObservation(visitAnswer?.observation || '');
    setCommitments(visitAnswer?.commitments || []);
    setNewCommitment('');
    handleEditingChange(false);
  };

  useImperativeHandle(ref, () => ({
    cancelEditing: handleCancel,
  }));

  if (!isEditing) {
    return (
      <View>
        {/* Observación en modo lectura */}
        <View style={styles.observationCard}>
          <View style={styles.cardHeader}>
            <Icon name="document-text" size={20} color={APP_COLORS.info} />
            <Text style={styles.cardTitle}>Observaciones</Text>
            {!readonly && (
              <TouchableOpacity onPress={() => handleEditingChange(true)} style={styles.editButton}>
                <Icon name="create-outline" size={20} color={APP_COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.observationText}>
            {observation || 'Sin observaciones'}
          </Text>
        </View>

        {/* Compromisos en modo lectura */}
        <View style={styles.commitmentsCard}>
          <View style={styles.cardHeader}>
            <Icon name="checkmark-done" size={20} color={APP_COLORS.success} />
            <Text style={styles.cardTitle}>
              Compromisos ({commitments.length})
            </Text>
            {!readonly && (
              <TouchableOpacity onPress={() => handleEditingChange(true)} style={styles.editButton}>
                <Icon name="create-outline" size={20} color={APP_COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
          {commitments.length > 0 ? (
            <View style={styles.commitmentsList}>
              {commitments.map((commitment, index) => (
                <View key={index} style={styles.commitmentItem}>
                  <View style={styles.commitmentNumber}>
                    <Text style={styles.commitmentNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.commitmentText}>{commitment}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyCommitmentsText}>Sin compromisos</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.editorContainer}>
      {/* Observación en modo edición */}
      <View style={styles.observationCard}>
        <View style={styles.cardHeader}>
          <Icon name="document-text" size={20} color={APP_COLORS.info} />
          <Text style={styles.cardTitle}>Observaciones</Text>
        </View>
        <TextInput
          style={styles.observationInput}
          multiline
          numberOfLines={4}
          placeholder="Escribe la observación..."
          value={observation}
          onChangeText={setObservation}
          textAlignVertical="top"
        />
      </View>

      {/* Compromisos en modo edición */}
      <View style={styles.commitmentsCard}>
        <View style={styles.cardHeader}>
          <Icon name="checkmark-done" size={20} color={APP_COLORS.success} />
          <Text style={styles.cardTitle}>Compromisos ({commitments.length})</Text>
        </View>
        
        {/* Lista de compromisos existentes */}
        {commitments.map((commitment, index) => (
          <View key={index} style={styles.editableCommitmentItem}>
            <View style={styles.commitmentNumber}>
              <Text style={styles.commitmentNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={styles.commitmentInput}
              multiline
              value={commitment}
              onChangeText={(text) => editCommitment(index, text)}
              placeholder="Escribe el compromiso..."
            />
            <TouchableOpacity
              onPress={() => removeCommitment(index)}
              style={styles.deleteCommitmentButton}
            >
              <Icon name="trash-outline" size={16} color={APP_COLORS.primary} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Agregar nuevo compromiso */}
        <View style={styles.newCommitmentContainer}>
          <TextInput
            style={styles.newCommitmentInput}
            multiline
            placeholder="Agregar nuevo compromiso..."
            value={newCommitment}
            onChangeText={setNewCommitment}
          />
          <TouchableOpacity onPress={addCommitment} style={styles.addCommitmentButton}>
            <Icon name="add-circle" size={28} color={APP_COLORS.success} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botones de acción fijos en la parte inferior */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Icon name="close-outline" size={20} color={APP_COLORS.darkGray} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          <Icon name="checkmark-outline" size={20} color={APP_COLORS.white} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Cards styles
  observationCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.info,
  },
  commitmentsCard: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
    flex: 1,
  },
  editButton: {
    padding: 5,
  },
  
  // Observation styles
  observationText: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    lineHeight: 18,
  },
  observationInput: {
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: APP_COLORS.secondary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Commitments styles
  commitmentsList: {
    gap: 8,
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commitmentNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: APP_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitmentNumberText: {
    color: APP_COLORS.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  commitmentText: {
    fontSize: 13,
    color: APP_COLORS.secondary,
    flex: 1,
    lineHeight: 18,
  },
  emptyCommitmentsText: {
    fontSize: 13,
    color: APP_COLORS.darkGray,
    textAlign: 'center',
    marginTop: 10,
  },
  
  // Editable commitments styles
  editableCommitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: APP_COLORS.accent,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  commitmentInput: {
    flex: 1,
    borderWidth: 0,
    fontSize: 14,
    color: APP_COLORS.secondary,
    paddingVertical: 4,
    paddingHorizontal: 0,
    minHeight: 24,
  },
  deleteCommitmentButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  
  // Action buttons styles
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: APP_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.lightGray,
    gap: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.darkGray,
    flex: 1,
    gap: 8,
  },
  cancelButtonText: {
    color: APP_COLORS.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    gap: 8,
  },
  saveButtonText: {
    color: APP_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: APP_COLORS.lightGray,
    borderColor: APP_COLORS.darkGray,
    borderWidth: 1,
  },
  editorContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  
  // New commitment styles
  newCommitmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    gap: 12,
    paddingHorizontal: 4,
  },
  newCommitmentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: APP_COLORS.secondary,
    minHeight: 44,
    backgroundColor: APP_COLORS.white,
  },
  addCommitmentButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.success,
  },
}); 