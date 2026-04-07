import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { ResolveQuestionConfigurationForm } from '../../../../simon/components/ResolveQuestionConfigurationForm';
import { useFormControl } from '../../../../simon/hooks/useFormControl';
import { QuestionConfig } from '../../../../simon/interfaces/question-config';
import { InstrumentItem } from '../../../../../core/entities';
import { useItemControlsStore } from '../stores/itemControlsStore';

const APP_COLORS = {
  primary: '#bf0909',
  secondary: '#494949',
  accent: '#75a25d',
  background: '#f5f5f5',
  white: '#ffffff',
  lightGray: '#e0e0e0',
  darkGray: '#6c757d',
  success: '#75a25d',
  info: '#17a2b8',
};

const CommentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  comment: string;
  onSave: (comment: string) => void;
  itemCode: string;
  readOnly?: boolean;
}> = ({ visible, onClose, comment, onSave, readOnly }) => {
  const [tempComment, setTempComment] = React.useState(comment);

  React.useEffect(() => {
    setTempComment(comment);
  }, [comment]);

  const handleSave = () => {
    onSave(tempComment);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comentario</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={APP_COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.commentInput}
              readOnly={readOnly}
              multiline
              numberOfLines={4}
              placeholder="Escribe tu comentario aquí..."
              value={tempComment}
              onChangeText={setTempComment}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.counter}>
              {(tempComment || '').length} / 1000
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            {!readOnly && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const convertItemToQuestionConfig = (item: InstrumentItem): QuestionConfig => {
  const simonConfiguration = {
    multipleAswers: item.configuration.configuration.multipleAnswers,
    multipleOptions: item.configuration.configuration.multipleOptions,
    instructions: item.configuration.configuration.instructions,
    typeOption: item.configuration.configuration.typeOption as
      | 'NUMBER'
      | 'DATE'
      | 'DATETIME'
      | 'TEXT',
    skipQuestion: item.configuration.configuration.skipQuestion,
    otherOption: item.configuration.configuration.otherOption,
    score: item.configuration.configuration.score,
    textArea: item.configuration.configuration.textArea,
    intervalScore: item.configuration.configuration.intervalScore,
  };

  const simonOptions = (item.configuration.resolve.options || []).map(
    option => ({
      code: option.code,
      title: option.title,
      withDescription: option.withDescription,
      description: option.description,
      value: option.value,
      score: option.score,
      scoreMin: option.scoreMin || '',
      scoreMax: option.scoreMax || '',
      order: option.order,
      isCorrect: option.isCorrect,
      isOther: option.isOther,
      format: option.format as
        | 'NUMBER'
        | 'DATE'
        | 'DATETIME'
        | 'TEXT'
        | undefined,
    }),
  );

  const simonResolve = {
    order: item.configuration.resolve.order,
    title: item.configuration.resolve.title,
    options: simonOptions,
    withInstructions: item.configuration.resolve.withInstructions,
    instructions: item.configuration.resolve.instructions,
    withMultipleAnswers: item.configuration.resolve.withMultipleAnswers,
    withMultipleOptions: item.configuration.resolve.withMultipleOptions,
    typeOption: item.configuration.resolve.typeOption as
      | 'NUMBER'
      | 'DATE'
      | 'DATETIME'
      | 'TEXT',
    withSkipQuestion: item.configuration.resolve.withSkipQuestion,
    withOtherOption: item.configuration.resolve.withOtherOption,
    isTextArea: item.configuration.resolve.isTextArea,
    withOnlyDate: item.configuration.resolve.withOnlyDate,
    formatOtherOption: item.configuration.resolve.formatOtherOption as
      | 'NUMBER'
      | 'DATE'
      | 'DATETIME'
      | 'TEXT',
    intervalScore: [],
    withScore: item.configuration.resolve.withScore,
  };

  return {
    type: item.configuration.type as
      | 'TYPE_01'
      | 'TYPE_02'
      | 'TYPE_03'
      | 'TYPE_04'
      | 'TYPE_05'
      | 'TYPE_06'
      | 'TYPE_07'
      | 'TYPE_08',
    name: item.configuration.name,
    icon: null,
    configuration: simonConfiguration,
    resolve: simonResolve,
    answer: item.configuration.answer,
  };
};

interface ItemFormComponentProps {
  item: InstrumentItem;
  index: number;
  control: any;
  readonly?: boolean;
  onChangeValue: (itemCode: string, value: any) => void;
}

export const ItemFormComponent: React.FC<ItemFormComponentProps> = ({
  item,
  control,
  readonly = false,
  onChangeValue,
}) => {
  const [showCommentModal, setShowCommentModal] = React.useState(false);
  const { initializeControl } = useItemControlsStore();
  const controlState = useItemControlsStore(
    state => state.controls.get(item.code),
  );

  const question = convertItemToQuestionConfig(item);
  const itemControl = useFormControl(
    `${item.code.replace(/\./g, '_')}`,
    control,
    { required: item.rules.required },
    '',
  );

  React.useEffect(() => {
    const initialEnabled = !item.rules?.itsDependent;
    initializeControl(item.code, initialEnabled);
  }, [item.code, item.rules?.itsDependent, initializeControl]);

  const isEnabled = controlState?.enabled ?? true;

  React.useEffect(() => {
    if (isEnabled) {
      itemControl.enable();
    } else {
      itemControl.disable();
    }
  }, [isEnabled, itemControl]);

  const wrappedItemControl = React.useMemo(
    () => ({
      ...itemControl,
      enabled: isEnabled,
    }),
    [itemControl, isEnabled],
  );

  const otherControl = useFormControl(
    `${item.code.replace(/\./g, '_')}_other`,
    control,
    {},
    '',
  );

  const commentControl = useFormControl(
    `${item.code.replace(/\./g, '_')}_comment`,
    control,
    {},
    '',
  );

  const sizeControl = useFormControl(
    `${item.code.replace(/\./g, '_')}_size`,
    control,
    {},
    '',
  );

  const extensionControl = useFormControl(
    `${item.code.replace(/\./g, '_')}_extension`,
    control,
    {},
    '',
  );

  const nameFileControl = useFormControl(
    `${item.code.replace(/\./g, '_')}_filename`,
    control,
    {},
    '',
  );

  const actualOtherControl = question.resolve.withOtherOption
    ? otherControl
    : undefined;
  const actualSizeControl =
    question.type === 'TYPE_04' ? sizeControl : undefined;
  const actualExtensionControl =
    question.type === 'TYPE_04' ? extensionControl : undefined;
  const actualNameFileControl =
    question.type === 'TYPE_04' ? nameFileControl : undefined;

  const hasComment = commentControl.value && commentControl.value.trim() !== '';

  const handleSaveComment = (comment: string) => {
    commentControl.setValue(comment);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <View style={styles.itemNumber}>
          <Text style={styles.itemNumberText}>{item.order}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemCode}>{item.code}</Text>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemType}>{item.configuration.name}</Text>
        </View>
        <View style={styles.itemHeaderActions}>
          {item.rules.required && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>*</Text>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.commentButton,
              hasComment && styles.commentButtonActive,
            ]}
            onPress={() => setShowCommentModal(true)}>
            <Icon
              name="chatbubble-outline"
              size={16}
              color={hasComment ? APP_COLORS.white : APP_COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ResolveQuestionConfigurationForm
        number={item.order}
        question={question}
        idItem={item.id}
        codigoItem={item.code}
        control={wrappedItemControl}
        controlOther={actualOtherControl}
        controlSize={actualSizeControl}
        controlExtension={actualExtensionControl}
        controlNameFile={actualNameFileControl}
        readOnly={readonly}
        onChangeValue={value => {
          if (value && value.value !== undefined) {
            itemControl.setValue(value.value);
            onChangeValue(item.code, value.value);
          }
        }}
      />

      <CommentModal
        visible={showCommentModal}
        readOnly={readonly}
        onClose={() => setShowCommentModal(false)}
        comment={commentControl.value || ''}
        onSave={handleSaveComment}
        itemCode={item.code}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
    backgroundColor: APP_COLORS.white,
    borderRadius: 8,
    padding: 6,
    shadowColor: APP_COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    color: APP_COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginBottom: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.secondary,
    marginBottom: 2,
  },
  itemType: {
    fontSize: 11,
    color: APP_COLORS.darkGray,
    fontStyle: 'italic',
  },
  requiredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
  },
  itemHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentButton: {
    backgroundColor: APP_COLORS.white,
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.primary,
  },
  commentButtonActive: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 10,
    width: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_COLORS.secondary,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: APP_COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: APP_COLORS.secondary,
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: APP_COLORS.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: APP_COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: APP_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  counter: {
    textAlign: 'right',
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
});
