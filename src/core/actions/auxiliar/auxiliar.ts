import auxiliarApi from '../../../config/api/auxiliar.api';
import { InstitutionResponse, MonitoringMapper, StatusResponse } from '../../../infraestructure';
import { EndpointAuxiliar } from '../../constants';
import { Institution } from '../../entities';

export const getInstitucionEducativa = async (codigoModular: string, anexo: string): Promise<StatusResponse<Institution>> => {
  try {
    const resp = await auxiliarApi.api.get<StatusResponse<InstitutionResponse>>(EndpointAuxiliar.GetInstitution, {
      params: {
        codigoModular,
        anexo
      },
    });
    return {
      data: MonitoringMapper.InstitutionResponseToEntity(resp.data.data!),
      success: resp.data.success,
      messages: resp.data.messages,
      message: resp.data.message,
      statusCode: resp.data.statusCode,
    };
  } catch (error) {
    console.log(error);
    const result: StatusResponse<Institution> = {
      data: undefined,
      success: false,
      messages: ['Ocurrió un error al obtener institucion educativa!'],
      message: 'Ocurrió un error al obtener institucion educativa!',
      statusCode: 500,
    };
    return result;
  }
}