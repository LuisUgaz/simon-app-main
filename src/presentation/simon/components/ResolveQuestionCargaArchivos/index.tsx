import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Nota: Este componente requiere la instalación de @react-native-documents/picker:
// npm install @react-native-documents/picker --save
import * as DocumentPicker from '@react-native-documents/picker';
import { QuestionConfig } from '../../interfaces/question-config';
import { postUpload, postDownload } from '../../../../core/actions';
import { useAuthStore } from '../../../store/auth.store';
import { useMonitoringStore } from '../../../store/monitoring.store';
import { useSampleStore } from '../../../store/sample.store';
import OfflineFilesService from '../../../../infraestructure/services/offline-files.service';
// Nota: Para una implementación completa de descarga de archivos, instalar:
// npm install react-native-fs --save
// npm install react-native-file-viewer --save (recomendado para Android)

// Estilos
import { styles } from './styles';

interface Props {
  question: QuestionConfig;
  control: any;
  controlSize?: any;
  controlExtension?: any;
  controlNameFile?: any;
  idItem?: string;
  codigoItem?: any;
  readOnly?: boolean;
  onChangeValue?: (value: any) => void;
}

/**
 * Componente para preguntas de carga de archivos
 * Nota: Este componente usa @react-native-documents/picker, se debe instalar:
 * npm install @react-native-documents/picker --save
 */
export const ResolveQuestionCargaArchivos: React.FC<Props> = ({
  question,
  control,
  controlSize,
  controlExtension,
  controlNameFile,
  idItem,
  codigoItem,
  readOnly = true,
  onChangeValue,
}) => {
  // Estados
  const [fileName, setFileName] = useState<string>('');
  const [_fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>('');
  const [_fileUri, setFileUri] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [documentCode, setDocumentCode] = useState<string>('');

  const { isOffLine } = useAuthStore();
  const { currentSelectedAspect } = useMonitoringStore();
  const { sample: currentSample, visitAnswer: currentVisitAnswer } = useSampleStore();
  const offlineFilesService = OfflineFilesService.getInstance();

  const loadOfflineFile = React.useCallback(async (tempCode: string) => {
    const offlineFile = await offlineFilesService.getOfflineFileByTempCode(tempCode);
    if (offlineFile) {
      setFileName(offlineFile.originalFilename);
      setFileSize(offlineFile.fileSize);
      setFileType(offlineFile.fileExtension);
      setFileUri(offlineFile.localFilePath);
    }
  }, [offlineFilesService]);

  // Inicializar valores desde el control
  useEffect(() => {
    if (control.value) {
      setDocumentCode(control.value);

      if (control.value.startsWith('OFFLINE_')) {
        loadOfflineFile(control.value);
      } else {
        if (controlNameFile?.value) {
          setFileName(controlNameFile.value);
        }

        if (controlSize?.value) {
          setFileSize(Number(controlSize.value));
        }

        if (controlExtension?.value) {
          setFileType(controlExtension.value);
        }
      }
    } else {
      const allControlsEmpty =
        !control.value &&
        !controlNameFile?.value &&
        !controlSize?.value &&
        !controlExtension?.value;

      if (allControlsEmpty) {
        setDocumentCode('');
        setFileName('');
        setFileSize(0);
        setFileType('');
        setFileUri('');
      }
    }
  }, [
    control.value,
    controlNameFile?.value,
    controlSize?.value,
    controlExtension?.value,
    loadOfflineFile,
  ]);

  // Determinar el icono según la extensión
  const getFileIcon = (type: string): string => {
    const extension = type.toLowerCase();

    if (extension.includes('pdf')) return 'file-pdf-box';
    if (extension.includes('doc') || extension.includes('word'))
      return 'file-word-box';
    if (extension.includes('xls') || extension.includes('sheet'))
      return 'file-excel-box';
    if (extension.includes('ppt') || extension.includes('presentation'))
      return 'file-powerpoint-box';
    if (
      extension.includes('jpg') ||
      extension.includes('jpeg') ||
      extension.includes('png') ||
      extension.includes('image')
    )
      return 'file-image-box';
    if (
      extension.includes('zip') ||
      extension.includes('rar') ||
      extension.includes('compressed')
    )
      return 'zip-box';

    return 'file-outline';
  };

  // Formatear tamaño de archivo (KB para < 1MB, MB para >= 1MB)
  const formatFileSize = (size: number): string => {
    const sizeInMB = size / (1024 * 1024);

    if (sizeInMB < 1) {
      const sizeInKB = size / 1024;
      return `${sizeInKB.toFixed(0)} KB`;
    }

    return `${sizeInMB.toFixed(1)} MB`;
  };

  // Solicitar permisos de almacenamiento en Android
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      // Para Android 13+ (API 33+) no necesita permisos para carpeta interna
      if (Platform.Version >= 33) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permiso de almacenamiento',
          message:
            'La aplicación necesita acceso al almacenamiento para guardar archivos.',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Permitir',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  };

  // Obtener ruta de descarga segura
  const getSafeDownloadPath = async (fileName: string): Promise<string> => {
    const RNFS = require('react-native-fs');

    if (Platform.OS === 'ios') {
      // iOS: siempre usar DocumentDirectoryPath
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }

    // Android: intentar diferentes rutas según permisos
    const hasPermission = await requestStoragePermission();

    if (hasPermission) {
      // Intentar usar Downloads si tiene permisos
      try {
        const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        // Verificar si la carpeta existe y es accesible
        const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
        if (downloadDirExists) {
          return downloadPath;
        }
      } catch (error) {
        console.log(
          'Download directory not accessible, using internal storage',
        );
      }
    }

    // Fallback: usar carpeta interna de la app (siempre accesible)
    return `${RNFS.DocumentDirectoryPath}/${fileName}`;
  };

  // Abrir archivo de forma segura (compatible con Android 7+)
  const openFileSecurely = async (filePath: string, fileName: string) => {
    try {
      if (Platform.OS === 'ios') {
        // iOS: usar Linking directamente
        const fileUri = `file://${filePath}`;
        const supported = await Linking.canOpenURL(fileUri);

        if (supported) {
          await Linking.openURL(fileUri);
        } else {
          Alert.alert(
            'No disponible',
            'No hay una aplicación disponible para abrir este tipo de archivo.',
          );
        }
      } else {
        // Android: usar react-native-file-viewer (maneja File Providers automáticamente)
        try {
          const FileViewer = require('react-native-file-viewer');
          await FileViewer.open(filePath, {
            showOpenWithDialog: true,
            showAppsSuggestions: true,
          });
        } catch (fileViewerError) {
          console.log('FileViewer not available, trying alternative method');
          // Fallback: copiar a carpeta interna y abrir
          await openFileWithFallback(filePath, fileName);
        }
      }
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      Alert.alert('Error', 'No se pudo abrir el archivo.');
    }
  };

  // Método fallback para abrir archivos en Android
  const openFileWithFallback = async (filePath: string, fileName: string) => {
    try {
      const RNFS = require('react-native-fs');

      // Copiar archivo a carpeta interna si está en Downloads
      let internalPath = filePath;
      if (filePath.includes('/Download/')) {
        internalPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.copyFile(filePath, internalPath);
        console.log('Archivo copiado a carpeta interna para apertura segura');
      }

      // Usar Share para "abrir" el archivo
      await Share.share({
        title: fileName,
        message: `Abrir archivo: ${fileName}`,
        url: `file://${internalPath}`,
      });
    } catch (error) {
      console.error('Error en fallback:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir el archivo. Puedes encontrarlo en la carpeta de descargas.',
      );
    }
  };

  // Compartir archivo de forma segura
  const shareFileSecurely = async (filePath: string, fileName: string) => {
    try {
      // Intentar compartir el archivo directamente
      await Share.share({
        title: fileName,
        url: Platform.OS === 'ios' ? `file://${filePath}` : filePath,
      });
    } catch (error) {
      console.error('Error al compartir archivo:', error);

      // Fallback: compartir información del archivo
      try {
        await Share.share({
          title: 'Archivo descargado',
          message: `He descargado el archivo: ${fileName}\n\nUbicación: ${filePath}`,
        });
      } catch (fallbackError) {
        console.error('Error en fallback de compartir:', fallbackError);
        Alert.alert('Error', 'No se pudo compartir el archivo.');
      }
    }
  };

  // Validar tamaño de archivo (máximo 5MB)
  const validateFileSize = (size: number): boolean => {
    const maxSizeInMB = 5;
    const fileSizeInMB = size / (1024 * 1024);

    if (fileSizeInMB > maxSizeInMB) {
      Alert.alert(
        'Archivo muy grande',
        'El archivo seleccionado excede el tamaño máximo permitido de 5 MB.',
        [{ text: 'OK' }],
      );
      return false;
    }
    return true;
  };

  const saveFileOffline = async (file: DocumentPicker.DocumentPickerResponse) => {
    const extension = file.name?.split('.').pop() || '';
    const nombre = `offline-${codigoItem}-${Date.now()}.${extension}`;

    console.log('idItem seleccionado cargado', idItem)
    const result = await offlineFilesService.saveFileOffline(
      currentSample?.id || '',
      currentVisitAnswer?.id || '',
      currentSelectedAspect?.id || '',
      idItem || '',
      codigoItem || '',
      file.uri,
      file.name || 'archivo',
      file.type || 'application/octet-stream'
    );

    if (result.success && result.data) {
      const offlineFile = result.data;
      setDocumentCode(offlineFile.tempCode);
      setFileName(nombre);
      setFileSize(offlineFile.fileSize);
      setFileType(extension);
      setFileUri(offlineFile.localFilePath);

      control.onChange(offlineFile.tempCode);
      if (controlNameFile) controlNameFile.onChange(nombre);
      if (controlSize) controlSize.onChange((offlineFile.fileSize / (1024 * 1024)).toString());
      if (controlExtension) controlExtension.onChange(extension);

      if (onChangeValue) {
        onChangeValue({
          value: offlineFile.tempCode,
          fileName: nombre,
          fileSize: offlineFile.fileSize,
          fileType: extension,
          control,
          codigoItem,
        });
      }

      Alert.alert('Archivo Guardado Offline', 'El archivo se guardó localmente y se sincronizará cuando tengas conexión.');
    } else {
      throw new Error(result.message);
    }
  };


  const deleteOfflineFile = async (tempCode: string) => {
    const success = await offlineFilesService.deleteOfflineFile(tempCode);
    if (success) {
      setDocumentCode('');
      setFileName('');
      setFileSize(0);
      setFileType('');
      setFileUri('');

      control.onChange(null);
      if (controlNameFile) controlNameFile.onChange(null);
      if (controlSize) controlSize.onChange(null);
      if (controlExtension) controlExtension.onChange(null);

      if (onChangeValue) {
        onChangeValue({
          value: null,
          fileName: '',
          fileSize: 0,
          fileType: '',
          control,
          codigoItem,
        });
      }
    }
  };

  // Subir archivo al servidor
  const uploadFile = async (file: DocumentPicker.DocumentPickerResponse) => {
    setIsUploading(true);

    try {
      if (isOffLine) {
        await saveFileOffline(file);
      } else {
        const extension = file.name?.split('.').pop() || '';
        const nombre = `adjunto-${codigoItem}-${Date.now()}.${extension}`;

        const formData = new FormData();
        formData.append('archivo', {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: nombre,
        } as any);

        const response = await postUpload(formData, nombre);

        if (response.success && response.data) {
          const data =
            typeof response.data === 'string'
              ? JSON.parse(response.data)
              : response.data;

          if (data?.data?.codigoDocumento) {
            setDocumentCode(data.data.codigoDocumento);
            setFileName(nombre);
            setFileSize(file.size || 0);
            setFileType(extension);

            control.onChange(data.data.codigoDocumento);

            if (controlNameFile) {
              controlNameFile.onChange(nombre);
            }

            if (controlSize) {
              controlSize.onChange(((file.size || 0) / (1024 * 1024)).toString());
            }

            if (controlExtension) {
              controlExtension.onChange(extension);
            }

            if (onChangeValue) {
              onChangeValue({
                value: data.data.codigoDocumento,
                fileName: nombre,
                fileSize: file.size || 0,
                fileType: extension,
                control,
                codigoItem,
              });
            }

            Alert.alert('Éxito', 'El archivo se ha cargado correctamente.', [
              { text: 'OK' },
            ]);
          } else {
            throw new Error('No se recibió el código del documento');
          }
        } else {
          throw new Error(response.message || 'Error al subir archivo');
        }
      }
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al cargar el archivo. Inténtalo de nuevo.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Manejar selección de archivo
  const handleFilePick = async () => {
    if (isUploading) return;

    try {
      // Uso de la API correcta de @react-native-documents/picker
      const results = await DocumentPicker.pick({
        allowMultiSelection: false,
        mode: 'import',
      });

      // La API devuelve un array, tomamos el primer elemento
      const result = results[0];

      if (result) {
        // Validar tamaño
        if (!validateFileSize(result.size || 0)) {
          return;
        }

        // Establecer URI temporal
        setFileUri(result.uri);

        // Subir archivo al servidor
        await uploadFile(result);
      }
    } catch (error) {
      // Manejar los diferentes tipos de errores
      if (
        DocumentPicker.isErrorWithCode &&
        DocumentPicker.isErrorWithCode(error)
      ) {
        // Error con código de la biblioteca document-picker
        if (error.code === DocumentPicker.errorCodes.OPERATION_CANCELED) {
          console.log('El usuario canceló la selección de archivos');
        } else if (
          error.code === DocumentPicker.errorCodes.UNABLE_TO_OPEN_FILE_TYPE
        ) {
          console.error('No se puede abrir el tipo de archivo seleccionado');
          Alert.alert(
            'Error',
            'No se puede abrir el tipo de archivo seleccionado.',
            [{ text: 'OK' }],
          );
        } else if (error.code === DocumentPicker.errorCodes.IN_PROGRESS) {
          console.log('Ya hay una operación de selección en progreso');
        } else {
          console.error('Error al seleccionar archivo:', error);
          Alert.alert('Error', 'Error al seleccionar archivo.', [{ text: 'OK' }]);
        }
      } else {
        // Otro tipo de error
        console.error('Error al seleccionar archivo:', error);
        Alert.alert('Error', 'Error inesperado al seleccionar archivo.', [
          { text: 'OK' },
        ]);
      }
    }
  };

  // Eliminar archivo
  const deleteFile = () => {
    if (isDeleting) return;

    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este archivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              if (documentCode.startsWith('OFFLINE_')) {
                await deleteOfflineFile(documentCode);
              } else {
                setDocumentCode('');
                setFileName('');
                setFileSize(0);
                setFileType('');
                setFileUri('');

                control.onChange(null);
                if (controlNameFile) controlNameFile.onChange(null);
                if (controlSize) controlSize.onChange(null);
                if (controlExtension) controlExtension.onChange(null);

                if (onChangeValue) {
                  onChangeValue({
                    value: null,
                    fileName: '',
                    fileSize: 0,
                    fileType: '',
                    control,
                    codigoItem,
                  });
                }
              }
            } catch (error) {
              console.error('Error eliminando archivo:', error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Convertir datos a base64 para guardar en el dispositivo
  const dataToBase64 = async (data: any): Promise<string> => {
    try {
      // Si ya es un string (contenido del archivo), convertir directamente
      if (typeof data === 'string') {
        console.log('📄 Datos recibidos como string, convirtiendo a base64...');
        // Convertir string a base64
        return btoa(unescape(encodeURIComponent(data)));
      }

      // Si es un Blob real, usar FileReader
      if (data instanceof Blob) {
        console.log('📄 Datos recibidos como Blob, convirtiendo a base64...');
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              // Extraer solo la parte base64 (sin el prefijo data:...)
              const base64Data = reader.result.split(',')[1];
              resolve(base64Data);
            } else {
              reject(new Error('Failed to convert blob to base64'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(data);
        });
      }

      // Si es otro tipo de dato, intentar convertir a string primero
      console.log('📄 Tipo de dato desconocido, convirtiendo a string...');
      const stringData = String(data);
      return btoa(unescape(encodeURIComponent(stringData)));
    } catch (error) {
      console.error('Error al convertir datos a base64:', error);
      throw new Error('Failed to convert data to base64');
    }
  };

  // Descargar archivo físicamente al dispositivo
  const saveFile = async (data: any, fileName: string) => {
    try {
      console.log('📁 Iniciando descarga del archivo:', fileName);
      console.log('📊 Tipo de datos recibidos:', typeof data);

      // Convertir datos a base64 para procesar
      const base64Data = await dataToBase64(data);
      console.log('✅ Archivo procesado correctamente');

      // CÓDIGO PARA IMPLEMENTACIÓN COMPLETA (requiere react-native-fs):
      const RNFS = require('react-native-fs');
      const downloadPath = await getSafeDownloadPath(fileName);
      console.log('✅ Guardando archivo en:', downloadPath);
      await RNFS.writeFile(downloadPath, base64Data, 'base64');

      // Confirmar descarga exitosa y mostrar opciones
      const fileSizeBytes = typeof data === 'string' ? data.length : data.size || 0;
      const locationName = downloadPath.includes('Download')
        ? 'Downloads'
        : 'Documentos de la app';
      Alert.alert(
        'Descarga completada',
        `El archivo "${fileName}" se ha descargado correctamente.\n\nUbicación: ${locationName}\nTamaño: ${formatFileSize(
          fileSizeBytes,
        )}`,
        [
          {
            text: 'Abrir archivo',
            onPress: async () => {
              try {
                await openFileSecurely(downloadPath, fileName);
              } catch (error) {
                console.error('Error al abrir archivo:', error);
                Alert.alert('Error', 'No se pudo abrir el archivo.');
              }
            },
          },
          {
            text: 'Compartir',
            onPress: async () => {
              try {
                await shareFileSecurely(downloadPath, fileName);
              } catch (error) {
                console.error('Error al compartir:', error);
                // Fallback: compartir información del archivo
                await shareFileSecurely(downloadPath, fileName);
              }
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );
    } catch (error) {
      console.error('❌ Error al guardar archivo:', error);
      Alert.alert(
        'Error de descarga',
        'No se pudo guardar el archivo en el dispositivo. Verifica los permisos de almacenamiento.',
        [{ text: 'OK' }],
      );
    }
  };

  // Descargar archivo
  const downloadFile = async () => {
    if (!documentCode || !fileName || isDownloading) return;

    setIsDownloading(true);

    try {
      if (documentCode.startsWith('OFFLINE_')) {
        const offlineFile = await offlineFilesService.getOfflineFileByTempCode(documentCode);
        if (offlineFile) {
          const downloadPath = await getSafeDownloadPath(offlineFile.originalFilename);
          const RNFS = require('react-native-fs');
          await RNFS.copyFile(offlineFile.localFilePath, downloadPath);
          Alert.alert(
            'Archivo Copiado',
            'El archivo se ha copiado a la carpeta de descargas.',
            [
              {
                text: 'Abrir archivo',
                onPress: async () => {
                  try {
                    await openFileSecurely(downloadPath, offlineFile.originalFilename);
                  } catch (error) {
                    console.error('Error al abrir archivo:', error);
                    Alert.alert('Error', 'No se pudo abrir el archivo.');
                  }
                },
              },
              { text: 'OK' },
            ],
          );
        }
      } else {
        const response = await postDownload(documentCode, fileName);

        if (response.success && response.data) {
          await saveFile(response.data, fileName);
        } else {
          throw new Error(response.message || 'Error al descargar archivo');
        }
      }
    } catch (error) {
      console.error('❌ Error al descargar archivo:', error);
      Alert.alert('Error', 'Ocurrió un error al descargar el archivo.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Instrucciones */}
      {question.resolve.withInstructions && (
        <Text style={styles.instructions}>
          Nota: {question.resolve.instructions}
        </Text>
      )}

      {/* Área de carga */}
      <View style={styles.uploadContainer}>
        {isUploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Subiendo archivo...</Text>
          </View>
        ) : (
          <>
            <Icon name="cloud-upload" size={40} color="#6200ee" />

            {!fileName ? (
              <View>
                <Text style={styles.placeholderText}>
                  Selecciona un archivo para cargar
                </Text>
                <Text style={styles.formatsText}>
                  Formatos aceptados (.pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg), Máx 5 MB.
                </Text>
              </View>
            ) : (
              <View style={styles.fileInfoContainer}>
                <View style={styles.fileInfo}>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="paperclip"
                      size={24}
                      color="#666666"
                    />
                  </View>
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                    ellipsizeMode="middle">
                    {control.value}
                  </Text>
                </View>

                {/* Botones para archivo cargado */}
                <View style={styles.fileActions}>
                  {documentCode && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.downloadButton]}
                      onPress={downloadFile}
                      disabled={isDownloading}>
                      {isDownloading ? (
                        <ActivityIndicator size="small" color="#4CAF50" />
                      ) : (
                        <Icon name="download" size={16} color="#4CAF50" />
                      )}
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.downloadButtonText,
                        ]}>
                        {isDownloading ? 'Descargando...' : 'Descargar'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!readOnly && control.enabled && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={deleteFile}
                      disabled={isDeleting}>
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#f44336" />
                      ) : (
                        <Icon name="delete" size={16} color="#f44336" />
                      )}
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.deleteButtonText,
                        ]}>
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {!readOnly && control.enabled && !isUploading && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleFilePick}>
                <Text style={styles.uploadButtonText}>
                  {fileName ? 'Cambiar archivo' : 'Seleccionar archivo'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};
