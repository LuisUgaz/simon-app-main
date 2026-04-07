import configurationApi from '../../../config/api/configuration.api';
import {
  MonitoringInstrumentResponse,
  MonitoringMapper,
  StatusResponse,
} from '../../../infraestructure';
import { EndpointConfiguration, } from '../../constants';
import {
  MonitoringInstrument,
} from '../../entities';

export const getInstrument = async (
  id: string,
): Promise<StatusResponse<MonitoringInstrument>> => {
  try {
    const resp = await configurationApi.api.get<MonitoringInstrumentResponse>(EndpointConfiguration.DetailInstrument, {
      params: {
        id,
      },
    });

    console.log('instrument from configuration', resp)
    const result: StatusResponse<MonitoringInstrument> = {
      success: true,
      message: 'Encontrado',
      statusCode: 200,
      data: MonitoringMapper.MonitoringInstrumentResponseToEntity(
        resp.data!,
      ),
    };
    console.log(result)
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<MonitoringInstrument> = {
      message: 'Ocurrió un error al obtener el instrumento!',
      success: false,
      statusCode: 500,
      data: undefined,
    };
    return result;
  }
};