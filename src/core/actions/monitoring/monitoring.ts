import monitoringApi from '../../../config/api/monitoring.api';
import {
  InstitutionResponse,
  MonitoringInstrumentResponse,
  MonitoringMapper,
  MonitoringPlanResponse,
  PageRequest,
  SampleResponse,
  SitesResponse,
  StatusPageResponse,
  StatusResponse,
  VisitAnswerResponse,
  InstrumentItemResponse,
} from '../../../infraestructure';
import { EndpointMonitoring, ENUMS } from '../../constants';
import {
  MonitoringInstrument,
  MonitoringPlan,
  Sample,
  Visit,
  VisitAnswer,
  InstrumentItem,
} from '../../entities';

export const getPlans = async (
  request: PageRequest,
  query: string,
  lastKey: string,
  site: SitesResponse,
  isDirector: boolean,
  isFinished?: boolean,
  actorCode?: string,
  institution?: InstitutionResponse,
): Promise<StatusPageResponse<MonitoringPlan[]>> => {
  try {
    site.tipoSede = Number(site.tipoSedeIndice);

    let filtro: any = {
      page: request.page,
      pageSize: request.pageSize,
      query,
      lastKey,
      sede: site,
      institucion: institution ? institution : {},
      isDirector,
      codigoActor: actorCode,
      esCulminado: isFinished,
    };
    const resp = await monitoringApi.api.post<
      StatusPageResponse<MonitoringPlanResponse[]>
    >(EndpointMonitoring.Plans, filtro);

    const result: StatusPageResponse<MonitoringPlan[]> = {
      ...resp.data,
      data: resp.data.data.map(MonitoringMapper.MonitoringPlanResponseToEntity),
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusPageResponse<MonitoringPlan[]> = {
      status: {
        messages: ['Ocurrió un error al obtener los planes de monitoreo!'],
        statusCode: 500,
        success: false,
      },
      data: [],
      totalPages: 0,
      totalRows: 0,
    };
    return result;
  }
};

export const getPlan = async (
  id: string,
): Promise<StatusResponse<MonitoringPlan>> => {
  try {
    const resp = await monitoringApi.api.get<
      StatusResponse<MonitoringPlanResponse>
    >(EndpointMonitoring.DetailPlan, {
      params: {
        id,
      },
    });

    const result: StatusResponse<MonitoringPlan> = {
      ...resp.data,
      data: MonitoringMapper.MonitoringPlanResponseToEntity(resp.data.data!),
    };

    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<MonitoringPlan> = {
      message: 'Ocurrió un error al obtener el plan de monitoreo!',
      success: false,
      statusCode: 500,
      data: undefined,
    };
    return result;
  }
};

export const getInstruments = async (
  request: PageRequest,
  query: string,
  lastKey: string,
  idPlan: string,
): Promise<StatusPageResponse<MonitoringInstrument[]>> => {
  try {
    let filtro: any = {
      page: request.page,
      pageSize: request.pageSize,
      query,
      lastKey,
      idPlanMonitoreo: idPlan,
    };
    const resp = await monitoringApi.api.post<
      StatusPageResponse<MonitoringInstrumentResponse[]>
    >(EndpointMonitoring.Instruments, filtro);

    const result: StatusPageResponse<MonitoringInstrument[]> = {
      ...resp.data,
      data: resp.data.data.map(
        MonitoringMapper.MonitoringInstrumentResponseToEntity,
      ),
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusPageResponse<MonitoringInstrument[]> = {
      status: {
        messages: ['Ocurrió un error al obtener los planes de monitoreo!'],
        statusCode: 500,
        success: false,
      },
      data: [],
      totalPages: 0,
      totalRows: 0,
    };
    return result;
  }
};

export const getInstrument = async (
  id: string,
): Promise<StatusResponse<MonitoringInstrument>> => {
  try {
    const resp = await monitoringApi.api.get<
      StatusResponse<MonitoringInstrumentResponse>
    >(EndpointMonitoring.DetailInstrument, {
      params: {
        id,
      },
    });

    const result: StatusResponse<MonitoringInstrument> = {
      ...resp.data,
      data: MonitoringMapper.MonitoringInstrumentResponseToEntity(
        resp.data.data!,
      ),
    };

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

export const getSamples = async (
  request: PageRequest,
  documentNumber: string,
  documentType: string,
  query: string,
  typeSite: number,
  codeSite: string,
  lastKey: string,
  instrumentId: string,
): Promise<StatusPageResponse<Sample[]>> => {
  try {
    let filtro: any = {
      numeroDocumentoMonitor: documentNumber,
      tipoDocumentoMonitor: documentType,
      page: request.page,
      pageSize: request.pageSize,
      query,
      lastKey,
      tipoSede: typeSite,
      codigoSede: codeSite,
      idInstrumento: instrumentId,
      esActivo: true,
    };
    const resp = await monitoringApi.api.post<
      StatusPageResponse<SampleResponse[]>
    >(EndpointMonitoring.Samples, filtro);

    const result: StatusPageResponse<Sample[]> = {
      ...resp.data,
      data: resp.data.data.map(MonitoringMapper.SampleResponseToEntity),
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusPageResponse<Sample[]> = {
      status: {
        messages: ['Ocurrió un error al obtener los Muestras!'],
        statusCode: 500,
        success: false,
      },
      data: [],
      totalPages: 0,
      totalRows: 0,
    };
    return result;
  }
};

export const getSampleVisits = async (
  request: PageRequest,
  query: string,
  lastKey: string,
  idSample: string,
): Promise<StatusPageResponse<VisitAnswer[]>> => {
  try {
    let filtro: any = {
      page: request.page,
      pageSize: request.pageSize,
      query,
      lastKey,
      idMuestra: idSample,
    };
    const resp = await monitoringApi.api.post<
      StatusPageResponse<VisitAnswerResponse[]>
    >(EndpointMonitoring.Visits, filtro);

    console.log('VISITS RESPONSE', resp.data);
    const result: StatusPageResponse<VisitAnswer[]> = {
      ...resp.data,
      data: resp.data.data.map(MonitoringMapper.VisitAnswerResponseToEntity),
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusPageResponse<VisitAnswer[]> = {
      status: {
        messages: ['Ocurrió un error al obtener las Visitas!'],
        statusCode: 500,
        success: false,
      },
      data: [],
      totalPages: 0,
      totalRows: 0,
    };
    return result;
  }
};

export const getSampleVisit = async (
  id: string,
): Promise<StatusResponse<VisitAnswer>> => {
  try {
    const resp = await monitoringApi.api.get<
      VisitAnswerResponse
    >(`${EndpointMonitoring.GetVisitaMuestra}?id=${id}`);

    console.log('VISIT RESPONSE', resp, resp.data);

    if (!resp.data) {
      return {
        statusCode: 404,
        message: 'No se encontró la visita solicitada',
        messages: ['No se encontró la visita solicitada'],
        success: false,
        data: undefined,
      };
    }

    const result: StatusResponse<VisitAnswer> = {
      statusCode: resp.status,
      message: "se encontro la visita",
      messages: [],
      success: true,
      data: MonitoringMapper.VisitAnswerResponseToEntity(resp.data),
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<VisitAnswer> = {
      statusCode: 500,
      message: 'Ocurrió un error al obtener la Visita!',
      messages: ['Ocurrió un error al obtener la Visita!'],
      success: false,
      data: undefined,
    };
    return result;
  }
};

export const sendAddScheduleVisit = async (
  visit: Visit,
): Promise<StatusResponse<boolean>> => {
  try {
    let body: any = {
      id: visit.id,
      idMuestra: visit.sampleId,
      numeroVisita: visit.visitNumber,
      enuEstado: visit.status,
      codigo: visit.code,
      fechaProgramacion: visit.scheduledDate,
      horaInicio: visit.startTime,
      horaInicioString: visit.startTime,
      horaFin: visit.endTime,
      horaFinString: visit.endTime,
      enuTipoVisita: visit.type,
      datoAdicional: visit.comment,
      tipoVisitaDescripcion:
        ENUMS.configuracion.tipoVisita.descriptions[visit.type],
    };
    console.log('BODY ADD', body);
    const resp = await monitoringApi.api.post<StatusResponse<boolean>>(
      EndpointMonitoring.AddSampleVisit,
      body,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al añadir visita!'],
      message: 'Ocurrió un error al añadir visita!',
      statusCode: 500,
    };
    return result;
  }
};

export const sendUpdateScheduleVisit = async (
  sampleId: string,
  visit: Visit,
): Promise<StatusResponse<boolean>> => {
  try {
    let body: any = {
      id: visit.id,
      idMuestra: sampleId,
      numeroVisita: visit.visitNumber,
      enuEstado: visit.status,
      codigo: visit.code,
      fechaProgramacion: visit.scheduledDate,
      horaInicio: visit.startTime,
      horaInicioString: visit.startTime,
      horaFin: visit.endTime,
      horaFinString: visit.endTime,
      enuTipoVisita: visit.type,
      datoAdicional: visit.comment,
      tipoVisitaDescripcion:
        ENUMS.configuracion.tipoVisita.descriptions[visit.type],
    };
    console.log('BODY', body);
    const resp = await monitoringApi.api.patch<StatusResponse<boolean>>(
      EndpointMonitoring.UpdateSampleVisit,
      body,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al actualizar visita!'],
      message: 'Ocurrió un error al actualizar visita!',
      statusCode: 500,
    };
    return result;
  }
};

export const getItemsByInstrumentAspect = async (
  instrumentId: string,
  aspectId: string,
): Promise<StatusResponse<InstrumentItem[]>> => {
  try {
    const resp = await monitoringApi.api.get<
      StatusResponse<InstrumentItemResponse[]>
    >(`${EndpointMonitoring.GetItemsByInstrumentAspect}?idInstrumento=${instrumentId}&idAspecto=${aspectId}`);

    console.log('ITEMS BY INSTRUMENT ASPECT RESPONSE', resp.data);

    if (!resp.data.data) {
      return {
        statusCode: 404,
        message: 'No se encontraron items para el instrumento y aspecto especificados',
        messages: ['No se encontraron items para el instrumento y aspecto especificados'],
        success: false,
        data: [],
      };
    }

    const result: StatusResponse<InstrumentItem[]> = {
      statusCode: resp.data.statusCode,
      message: resp.data.message,
      messages: resp.data.messages,
      success: resp.data.success,
      data: resp.data.data.map(MonitoringMapper.InstrumentItemResponseToEntity),
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<InstrumentItem[]> = {
      statusCode: 500,
      message: 'Ocurrió un error al obtener los items del instrumento por aspecto!',
      messages: ['Ocurrió un error al obtener los items del instrumento por aspecto!'],
      success: false,
      data: [],
    };
    return result;
  }



};

export const getByAnswerVisitaAspect = async (
  visitId: string,
  aspectId: string,
): Promise<StatusResponse<any[]>> => {
  try {
    const resp = await monitoringApi.api.get<StatusResponse<any[]>>(
      `${EndpointMonitoring.GetByVisitaAspect}?idVisitaMuestra=${visitId}&idAspecto=${aspectId}`
    );

    console.log('GET BY VISITA ASPECT RESPONSE', resp.data);

    if (!resp.data.data) {
      return {
        statusCode: 404,
        message: 'No se encontraron respuestas para la visita y aspecto especificados',
        messages: ['No se encontraron respuestas para la visita y aspecto especificados'],
        success: false,
        data: [],
      };
    }

    const result: StatusResponse<any[]> = {
      statusCode: resp.data.statusCode,
      message: resp.data.message,
      messages: resp.data.messages,
      success: resp.data.success,
      data: resp.data.data, // Por ahora sin mapper, solo retornamos los datos
    };
    return result;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<any[]> = {
      statusCode: 500,
      message: 'Ocurrió un error al obtener las respuestas de la visita por aspecto!',
      messages: ['Ocurrió un error al obtener las respuestas de la visita por aspecto!'],
      success: false,
      data: [],
    };
    return result;
  }
};

export const updateSampleVisitExecution = async (
  visit: VisitAnswerResponse,
): Promise<StatusResponse<boolean>> => {
  try {
    const resp = await monitoringApi.api.put<StatusResponse<boolean>>(
      EndpointMonitoring.UpdateSampleVisitExecution,
      visit,
    );

    return resp.data;
  } catch (error: any) {
    console.log({ error }, error?.message);
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al actualizar la ejecución de la visita!'],
      message: 'Ocurrió un error al actualizar la ejecución de la visita!',
      statusCode: 500,
    };
    return result;
  }
};

export const updateExecutionStartWithReplacement = async (
  visit: VisitAnswerResponse,
): Promise<StatusResponse<boolean>> => {
  try {
    const resp = await monitoringApi.api.put<StatusResponse<boolean>>(
      EndpointMonitoring.UpdateExecutionStartWithReplacement,
      visit,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al actualizar la ejecución con reemplazo!'],
      message: 'Ocurrió un error al actualizar la ejecución con reemplazo!',
      statusCode: 500,
    };
    return result;
  }
};

export const updateRescheduling = async (
  visit: VisitAnswerResponse,
): Promise<StatusResponse<boolean>> => {
  try {
    const resp = await monitoringApi.api.put<StatusResponse<boolean>>(
      EndpointMonitoring.UpdateRescheduling,
      visit,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al reprogramar la visita!'],
      message: 'Ocurrió un error al reprogramar la visita!',
      statusCode: 500,
    };
    return result;
  }
};

export const updateCompletedWithoutExecution = async (
  visit: VisitAnswerResponse,
): Promise<StatusResponse<boolean>> => {
  try {
    const resp = await monitoringApi.api.put<StatusResponse<boolean>>(
      EndpointMonitoring.UpdateCompletedWithoutExecution,
      visit,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al culminar la visita sin ejecución!'],
      message: 'Ocurrió un error al culminar la visita sin ejecución!',
      statusCode: 500,
    };
    return result;
  }
};

export const sendVisitAnswers = async (
  visitAnswerData: any,
): Promise<StatusResponse<boolean>> => {
  try {
    console.log('📤 Enviando respuestas de visita al backend ADD LIST:', visitAnswerData);
    const resp = await monitoringApi.api.post<StatusResponse<boolean>>(
      EndpointMonitoring.AddList,
      visitAnswerData,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al enviar las respuestas de la visita!'],
      message: 'Ocurrió un error al enviar las respuestas de la visita!',
      statusCode: 500,
    };
    return result;
  }
};

export const sendObservationAndCommitments = async (
  visitId: string,
  observation: string,
  commitments: string[],
): Promise<StatusResponse<boolean>> => {
  try {
    const body = {
      id: visitId,
      observacion: observation,
      compromisos: commitments,
    };

    console.log('📤 Enviando observación y compromisos al backend:', body);
    const resp = await monitoringApi.api.put<StatusResponse<boolean>>(
      EndpointMonitoring.SendCommitment,
      body,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al enviar observación y compromisos!'],
      message: 'Ocurrió un error al enviar observación y compromisos!',
      statusCode: 500,
    };
    return result;
  }
};

export const sendVisitMuestra = async (
  visitAnswer: VisitAnswerResponse,
): Promise<StatusResponse<boolean>> => {
  try {
    console.log('📤 Enviando visita de muestra al backend:', visitAnswer);
    visitAnswer.aspectosCompletados = [];
    const resp = await monitoringApi.api.put<StatusResponse<boolean>>(
      EndpointMonitoring.SendInstrumentAnswers,
      visitAnswer,
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al enviar la visita de muestra!'],
      message: 'Ocurrió un error al enviar la visita de muestra!',
      statusCode: 500,
    };
    return result;
  }
};

export const addAutoSample = async (id: string, samples: any[]): Promise<StatusResponse<boolean>> => {
  try {
    const resp = await monitoringApi.api.post<StatusResponse<boolean>>(
      EndpointMonitoring.AddSample,
      {
        idInstrumento: id,
        muestras: samples,
      },
    );

    return resp.data;
  } catch (error) {
    console.log({ error });
    const result: StatusResponse<boolean> = {
      data: false,
      success: false,
      messages: ['Ocurrió un error al añadir muestras!'],
      message: 'Ocurrió un error al añadir muestras!',
      statusCode: 500,
    };
    return result;
  }
};
