import filesApi from '../../../config/api/files.api';
import { EndpointFiles } from '../../constants';
import { StatusResponse } from '../../../infraestructure';

export const postUpload = async (
  formData: FormData,
  description?: string,
): Promise<StatusResponse<any>> => {
  try {
    // Agregar descripción si se proporciona
    if (description) {
      formData.append('descripcionDocumento', description);
    }

    console.log('📤 Uploading file with description:', formData, description);
    
    const resp = await filesApi.api.post<StatusResponse<any>>(
      EndpointFiles.Upload, // Usando el endpoint /files/upload
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ File upload response:', resp.data);
    return resp.data;
  } catch (error) {
    console.log('❌ File upload error:', error);
    const result: StatusResponse<any> = {
      statusCode: 500,
      message: 'Ocurrió un error al cargar el archivo!',
      messages: ['Ocurrió un error al cargar el archivo!'],
      success: false,
      data: undefined,
    };
    return result;
  }
};

export const postDownload = async (
  codigo: string,
  name: string,
): Promise<StatusResponse<any>> => {
  try {
    console.log('📥 Downloading file with code:', codigo, 'and name:', name);
    
    const resp = await filesApi.api.post(
      `${EndpointFiles.Download}/${codigo}/${name}`,
      {}, // Body vacío para POST
      {
        responseType: 'blob', // Configuración correcta para blob
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/octet-stream',
        },
      }
    );

    console.log('✅ File download response received');
    console.log('📊 Response type:', typeof resp.data);
    console.log('📊 Response data:', resp.data);
    
    // Para downloads de archivos, creamos una respuesta exitosa
    const result: StatusResponse<any> = {
      statusCode: 200,
      message: 'Archivo descargado exitosamente',
      messages: ['Archivo descargado exitosamente'],
      success: true,
      data: resp.data,
    };
    
    return result;
  } catch (error) {
    console.log('❌ File download error:', error);
    const result: StatusResponse<any> = {
      statusCode: 500,
      message: 'Ocurrió un error al descargar el archivo!',
      messages: ['Ocurrió un error al descargar el archivo!'],
      success: false,
      data: undefined,
    };
    return result;
  }
};
