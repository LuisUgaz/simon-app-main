import {
  Site,
  MonitoringPlan,
  Institution,
  Aspect,
  VisitInstrument,
  MonitoringInstrument,
  Sample,
  VisitAnswer,
  BinnacleVisit,
  NestedSample,
  NestedVisit,
  NestedInstrument,
  NestedPlan,
  InstrumentItem,
  ItemOption,
  ItemConfiguration,
  ItemResolve,
  ItemType,
  ItemRule,
} from '../../core/entities';
import {SitesResponse} from '../interfaces/auth.response';
import {
  AspectResponse,
  MonitoringInstrumentResponse,
  SampleResponse,
  VisitAnswerResponse,
  VisitResponse,
  NestedSampleResponse,
  NestedVisitResponse,
  NestedInstrumentResponse,
  NestedPlanResponse,
  InstrumentItemResponse,
  ItemOptionResponse,
  ItemConfigurationResponse,
  ItemResolveResponse,
  ItemTypeResponse,
  ItemRuleResponse,
} from '../interfaces/monitoring.response';
import {
  MonitoringPlanResponse,
  InstitutionResponse,
} from '../interfaces/monitoring.response';
import {
  BitacoraVisita,
} from '../interfaces/monitoring.response';

export class MonitoringMapper {
  static SitesResponseToEntity(siteResponse: SitesResponse): Site {
    return {
      roleCode: siteResponse?.codigoRol,
      code: siteResponse?.codigoSede,
      anexo: siteResponse?.anexo,
      roleName: siteResponse?.nombreRol,
      name: siteResponse?.nombreSede,
      principal: siteResponse?.principal,
      type: siteResponse?.tipoSede,
      typeIndex: siteResponse?.tipoSedeIndice,
    };
  }
  static SiteEntityToSitesResponse(site: Site): SitesResponse {
    return {
      codigoRol: site?.roleCode,
      codigoSede: site?.code,
      anexo: site?.anexo,
      nombreRol: site?.roleName,
      nombreSede: site?.name,
      principal: site?.principal,
      tipoSede: site?.type,
      tipoSedeIndice: site?.typeIndex,
      encrypt: '',
    };
  }
  static InstitutionEntityToInstitutionResponse(
    institution: Institution,
  ): InstitutionResponse {
    return {
      codigoSede: institution.siteCode,
      codigoModular: institution.modularCode,
      anexo: institution.anexo,
      nombre: institution.name,
      tipoGestion: institution.typeManagement,
      dscTipoGestion: institution.typeManagementDescription,
      nivel: institution.level,
      descripcionNivel: institution.levelDescription,
      direccion: institution.address,
      codigoUbigeo: institution.ubigeoCode,
      codigoIgel: institution.igelCode,
      codigoLocal: institution.localCode,
      codigoDre: institution.dreCode,
      nombreDre: institution.dreName,
      codigoUgel: institution.ugelCode,
      nombreUgel: institution.ugelName,
    };
  }
  static MonitoringPlanResponseToEntity(
    planResponse: MonitoringPlanResponse,
  ): MonitoringPlan {
    return {
      id: planResponse.id,
      key: planResponse.key,
      code: planResponse.codigo,
      name: planResponse.nombre,
      actors: planResponse.actores,
      dre: planResponse.dre
        ? MonitoringMapper.SitesResponseToEntity(planResponse.dre)
        : undefined,
      ugel: planResponse.ugel
        ? MonitoringMapper.SitesResponseToEntity(planResponse.ugel)
        : undefined,
      ugels: planResponse.ugels.map(MonitoringMapper.SitesResponseToEntity),
      site: MonitoringMapper.SitesResponseToEntity(planResponse.sede),
      period: planResponse.periodo,
      description: planResponse.descripcion,
      periodMin: planResponse.periodoMinimo,
      periodMax: planResponse.periodoMaximo,
      startDate: planResponse.fechaInicio,
      endDate: planResponse.fechaFin,
      isActive: planResponse.esActivo,
      isFinish: planResponse.esCulminado,
      public: planResponse.publicado,
      enuType: planResponse.enuTipo,
      typeDescription: planResponse.tipoDescripcion,
      idLogicalFramework: planResponse.idMarcoLogico,
      nameLogicalFramework: planResponse.marcoLogicoNombre,
      logicalFramework: planResponse.marcoLogico,
      stage: planResponse.etapa,
      stageDescription: planResponse.etapaDescripcion,
      mode: planResponse.modalidad,
      modeDescription: planResponse.modalidadDescripcion,
    };
  }
  static AspectResponseToEntity(aspect: AspectResponse): Aspect {
    return {
      id: aspect.id,
      code: aspect.codigo,
      name: aspect.nombre,
      componentId: aspect.idComponente,
      indicatorId: aspect.idIndicador,
      resultId: aspect.idResultado,
      weighted: aspect.ponderado,
    };
  }
  static VisitResponseToEntity(visit: VisitResponse): VisitInstrument {
    return {
      code: visit.codigo,
      visitNumber: visit.numeroVisita,
      startDate: visit.fechaInicio,
      endDate: visit.fechaFin,
      isCanceled: visit.esAnulado,
    };
  }
  static MonitoringInstrumentResponseToEntity(
    instrument: MonitoringInstrumentResponse,
  ): MonitoringInstrument {
    return {
      id: instrument.id,
      key: instrument.key,
      monitoringPlanId: instrument.idPlanMonitoreo,
      monitorsEnums: instrument.enuMonitores,
      sampleEnum: instrument.enuMuestra,
      sampleDescription: instrument.muestraDescripcion,
      typeEnum: instrument.enuTipo,
      typeDescription: instrument.tipoDescripcion,
      component: instrument.componente,
      result: instrument.resultado,
      indicator: instrument.indicador,
      aspects: instrument.aspectos
        ? instrument.aspectos.map(aspect =>
            MonitoringMapper.AspectResponseToEntity(aspect),
          )
        : [],
      visits: instrument.visitas
        ? instrument.visitas.map(visit =>
            MonitoringMapper.VisitResponseToEntity(visit),
          )
        : [],
      resources: instrument.recursos,
      isGia: instrument.esGia,
      giaTypeEnum: instrument.enuTipoGia,
      giaTypeDescription: instrument.tipoGiaDescripcion,
      code: instrument.codigo,
      name: instrument.nombre,
      stage: instrument.etapa,
      stageDescription: instrument.etapaDescripcion,
      modality: instrument.modalidad,
      modalityDescription: instrument.modalidadDescripcion,
      level: instrument.nivel,
      levelDescription: instrument.nivelDescripcion,
      cycle: instrument.ciclo,
      cycleDescription: instrument.cicloDescripcion,
      appliesToAllTeachers: instrument.aplicaTodosDocentes,
      isAutoevaluationOfTeachers: instrument.esAutoevaluacionDelDocentes,
      area: instrument.area,
      areaDescription: instrument.areaDescripcion,
      reference: instrument.referencia,
      isActive: instrument.esActivo,
      startRules: instrument.inicioReglas,
      published: instrument.publicado,
      creationDate: instrument.fechaCreacion,
    };
  }
  static InstitutionResponseToEntity(institution: InstitutionResponse): Institution {
    return {
      siteCode: institution.codigoSede,
      modularCode: institution.codigoModular,
      anexo: institution.anexo,
      name: institution.nombre,
      typeManagement: institution.tipoGestion,
      typeManagementDescription: institution.dscTipoGestion,
      level: institution.nivel,
      levelDescription: institution.descripcionNivel,
      address: institution.direccion,
      ubigeoCode: institution.codigoUbigeo,
      igelCode: institution.codigoIgel,
      localCode: institution.codigoLocal,
      dreCode: institution.codigoDre,
      dreName: institution.nombreDre,
      ugelCode: institution.codigoUgel,
      ugelName: institution.nombreUgel,
    };
  }
  static SampleResponseToEntity(sample: SampleResponse): Sample {
    return {
      id: sample.id,
      key: sample.key,
      idInstrument: sample.idInstrumento,
      idSampleType: sample.idTipoMuestra,
      sampleTypeDescription: sample.tipoMuestraDescripcion,
      documentType: sample.tipoDocumento,
      documentNumber: sample.numeroDocumento,
      firstName: sample.nombres,
      lastName: sample.primerApellido,
      middleName: sample.segundoApellido,
      site: sample.sede
        ? MonitoringMapper.SitesResponseToEntity(sample.sede)
        : undefined,
      dre: sample.dre,
      dreDescription: sample.dreDescripcion,
      ugel: sample.ugel,
      ugelDescription: sample.ugelDescripcion,
      idLevel: sample.idNivel,
      levelDescription: sample.nivelDescripcion,
      network: sample.red,
      networkDescription: sample.redDescripcion,
      modularCode: sample.codigoModular,
      anexo: sample.anexo,
      iieeName: sample.iieeNombre,
      monitorType: sample.enuTipoMonitor,
      monitorTypeDescription: sample.tipoMonitorDescripcion,
      monitorDocumentType: sample.monitorTipoDocumento,
      monitorDocumentNumber: sample.monitorNumeroDocumento,
      monitorFirstName: sample.monitorNombres,
      monitorLastName: sample.monitorPrimerApellido,
      monitorMiddleName: sample.monitorSegundoApellido,
      monitorSite: sample.monitorSede
        ? MonitoringMapper.SitesResponseToEntity(sample.monitorSede)
        : undefined,
      visits: sample.visitas
        ? sample.visitas.map(MonitoringMapper.VisitAnswerResponseToEntity)
        : [],
      isActive: sample.esActivo,
      isCanceled: sample.esAnulado,
      isReplaced: sample.esReemplazado,
      replacement: sample.reemplazo,
      fullName: sample.nombreCompleto,
      lastNames: sample.apellidos,
      creationDate: sample.fechaCreacion,
      modificationDate: sample.fechaModificacion,
      createdBy: sample.usuarioCreacion,
      modifiedBy: sample.usuarioModificacion,
      inKey: sample.inKey,
    };
  }

  static VisitAnswerResponseToEntity(visit: VisitAnswerResponse): VisitAnswer {
    return {
      id: visit.id,
      sampleId: visit.idMuestra,
      visitNumber: visit.numeroVisita,
      code: visit.codigo,
      visitType: visit.enuTipoVisita,
      visitTypeDescription: visit.tipoVisitaDescripcion,
      status: visit.enuEstado,
      completedAspects: visit.aspectosCompletados,
      subjectFound: visit.seEncontroSujetoDeMonitoreo,
      withReplacement: visit.conReemplazo,
      isRescheduled: visit.esReprogramada,
      scheduledDate: visit.fechaProgramacion,
      startTime: visit.horaInicio,
      endTime: visit.horaFin,
      additionalData: visit.datoAdicional,
      isExecutionAdjustment: visit.esReintegroDeEjecucion,
      executionStartDate: visit.fechaInicioEjecucion,
      executionStartTime: visit.horaInicioEjecucion,
      executionEndDate: visit.fechaCierreEjecucion,
      executionEndTime: visit.horaFinCierreEjecucion,
      isCanceled: visit.esAnulado,
      auxiliaryFirstName: visit.nombresAuxiliar,
      auxiliaryLastName: visit.primerApellidoAuxiliar,
      auxiliaryMiddleName: visit.segundoApellidoAuxiliar,
      observation: visit.observacion,
      commitments: visit.compromisos,
      monitorType: visit.enuTipoMonitor,
      monitorTypeDescription: visit.tipoMonitorDescripcion,
      monitorDocumentType: visit.monitorTipoDocumento,
      monitorDocumentNumber: visit.monitorNumeroDocumento,
      monitorFirstName: visit.monitorNombres,
      monitorLastName: visit.monitorPrimerApellido,
      monitorMiddleName: visit.monitorSegundoApellido,
      monitorSite: visit.monitorSede 
        ? MonitoringMapper.SitesResponseToEntity(visit.monitorSede)
        : undefined,
      sample: visit.muestra 
        ? MonitoringMapper.NestedSampleResponseToEntity(visit.muestra)
        : undefined,
      instrument: visit.instrumento 
        ? MonitoringMapper.NestedInstrumentResponseToEntity(visit.instrumento)
        : undefined,
      plan: visit.plan 
        ? MonitoringMapper.NestedPlanResponseToEntity(visit.plan)
        : undefined,
      executionError: visit.errorEjecucion,
      binnacle: visit.bitacora && visit.bitacora.length > 0 
        ? visit.bitacora.map(MonitoringMapper.BitacoraToEntity) 
        : [],
    };
  }

  static BitacoraToEntity(bitacora: BitacoraVisita): BinnacleVisit {
    return {
      binnacleType: bitacora.tipoBitacora,
      subjectFound: bitacora.seEncontroSujetoDeMonitoreo,
      comment: bitacora.comentario,
      rescheduled: bitacora.reprogramado,
      visitType: bitacora.tipoVisita,
      meetingLink: bitacora.linkReunion,
      visitDate: bitacora.fechaVisita,
      reschedulingVisitType: bitacora.tipoVisitaReprogramacion,
      reschedulingVisitDate: bitacora.fechaVisitaReprogramacion,
      reschedulingMeetingLink: bitacora.linkReunionReProgramacion,
      monitorType: bitacora.enuTipoMonitor,
      monitorTypeDescription: bitacora.tipoMonitorDescripcion,
      monitorDocumentType: bitacora.monitorTipoDocumento,
      monitorDocumentNumber: bitacora.monitorNumeroDocumento,
      monitorFirstName: bitacora.monitorNombres,
      monitorLastName: bitacora.monitorPrimerApellido,
      monitorMiddleName: bitacora.monitorSegundoApellido,
      monitorSite: MonitoringMapper.SitesResponseToEntity(bitacora.monitorSede as any),
      auxiliaryFirstName: bitacora.nombresAuxiliar,
      auxiliaryLastName: bitacora.primerApellidoAuxiliar,
      auxiliaryMiddleName: bitacora.segundoApellidoAuxiliar,
      creationDate: bitacora.fechaCreacion,
    };
  }

  /**
   * Mapea NestedSampleResponse a NestedSample
   */
  static NestedSampleResponseToEntity(sample: NestedSampleResponse): NestedSample {
    return {
      idInstrument: sample.idInstrumento,
      idSampleType: sample.idTipoMuestra,
      sampleTypeDescription: sample.tipoMuestraDescripcion,
      documentType: sample.tipoDocumento,
      documentNumber: sample.numeroDocumento,
      firstName: sample.nombres,
      lastName: sample.primerApellido,
      middleName: sample.segundoApellido,
      site: sample.sede ? {
        code: sample.sede.codigoSede,
        anexo: sample.sede.anexo,
        name: sample.sede.nombreSede,
        type: sample.sede.tipoSede,
        typeDescription: sample.sede.tipoSedeDescripcion,
      } : undefined,
      dre: sample.dre,
      dreDescription: sample.dreDescripcion,
      ugel: sample.ugel,
      ugelDescription: sample.ugelDescripcion,
      idLevel: sample.idNivel,
      levelDescription: sample.nivelDescripcion,
      network: sample.red,
      networkDescription: sample.redDescripcion,
      modularCode: sample.codigoModular,
      localCode: sample.codigoLocal,
      anexo: sample.anexo,
      iieeName: sample.iieeNombre,
      monitorType: sample.enuTipoMonitor,
      monitorTypeDescription: sample.tipoMonitorDescripcion,
      monitorDocumentType: sample.monitorTipoDocumento,
      monitorDocumentNumber: sample.monitorNumeroDocumento,
      monitorFirstName: sample.monitorNombres,
      monitorLastName: sample.monitorPrimerApellido,
      monitorMiddleName: sample.monitorSegundoApellido,
      monitorSite: sample.monitorSede ? {
        code: sample.monitorSede.codigoSede,
        anexo: sample.monitorSede.anexo,
        name: sample.monitorSede.nombreSede,
        type: sample.monitorSede.tipoSede,
        typeDescription: sample.monitorSede.tipoSedeDescripcion,
      } : undefined,
      visits: sample.visitas ? sample.visitas.map(MonitoringMapper.NestedVisitResponseToEntity) : [],
      isActive: sample.esActivo,
      isCanceled: sample.esAnulado,
      isReplaced: sample.esReemplazado,
      replacement: sample.reemplazo,
      id: sample.id,
      key: sample.key,
      creationDate: sample.fechaCreacion,
      modificationDate: sample.fechaModificacion,
      createdBy: sample.usuarioCreacion,
      modifiedBy: sample.usuarioModificacion,
      inKey: sample.inKey,
    };
  }

  /**
   * Mapea NestedVisitResponse a NestedVisit
   */
  static NestedVisitResponseToEntity(visit: NestedVisitResponse): NestedVisit {
    return {
      sampleId: visit.idMuestra,
      visitNumber: visit.numeroVisita,
      code: visit.codigo,
      visitType: visit.enuTipoVisita,
      visitTypeDescription: visit.tipoVisitaDescripcion,
      status: visit.enuEstado,
      completedAspects: visit.aspectosCompletados,
      subjectFound: visit.seEncontroSujetoDeMonitoreo,
      withReplacement: visit.conReemplazo,
      isRescheduled: visit.esReprogramada,
      scheduledDate: visit.fechaProgramacion,
      startTime: visit.horaInicio,
      endTime: visit.horaFin,
      additionalData: visit.datoAdicional,
      isExecutionAdjustment: visit.esReintegroDeEjecucion,
      executionStartDate: visit.fechaInicioEjecucion,
      executionStartTime: visit.horaInicioEjecucion,
      executionEndDate: visit.fechaCierreEjecucion,
      executionEndTime: visit.horaFinCierreEjecucion,
      isCanceled: visit.esAnulado,
      auxiliaryFirstName: visit.nombresAuxiliar,
      auxiliaryLastName: visit.primerApellidoAuxiliar,
      auxiliaryMiddleName: visit.segundoApellidoAuxiliar,
      observation: visit.observacion,
      commitments: visit.compromisos,
      monitorType: visit.enuTipoMonitor,
      monitorTypeDescription: visit.tipoMonitorDescripcion,
      monitorDocumentType: visit.monitorTipoDocumento,
      monitorDocumentNumber: visit.monitorNumeroDocumento,
      monitorFirstName: visit.monitorNombres,
      monitorLastName: visit.monitorPrimerApellido,
      monitorMiddleName: visit.monitorSegundoApellido,
      monitorSite: visit.monitorSede ? MonitoringMapper.SitesResponseToEntity(visit.monitorSede) : undefined,
      binnacle: visit.bitacora ? visit.bitacora.map(MonitoringMapper.BitacoraToEntity) : [],
      executionError: visit.errorEjecucion,
      id: visit.id,
      key: visit.key,
      creationDate: visit.fechaCreacion,
      modificationDate: visit.fechaModificacion,
      createdBy: visit.usuarioCreacion,
      modifiedBy: visit.usuarioModificacion,
      inKey: visit.inKey,
    };
  }

  /**
   * Mapea NestedInstrumentResponse a NestedInstrument
   */
  static NestedInstrumentResponseToEntity(instrument: NestedInstrumentResponse): NestedInstrument {
    return {
      version: instrument.version,
      monitoringPlanId: instrument.idPlanMonitoreo,
      monitorsEnums: instrument.enuMonitores,
      monitors: instrument.monitores,
      sampleEnum: instrument.enuMuestra,
      sampleDescription: instrument.muestraDescripcion,
      typeEnum: instrument.enuTipo,
      typeDescription: instrument.tipoDescripcion,
      component: instrument.componente,
      result: instrument.resultado,
      indicator: instrument.indicador,
      aspects: instrument.aspectos ? instrument.aspectos.map(aspect => ({
        id: aspect.id,
        componentId: aspect.idComponente,
        resultId: aspect.idResultado,
        indicatorId: aspect.idIndicador,
        code: aspect.codigo,
        name: aspect.nombre,
        weighted: aspect.ponderado,
      })) : [],
      visits: instrument.visitas ? instrument.visitas.map(visit => ({
        visitNumber: visit.numeroVisita,
        code: visit.codigo,
        startDate: visit.fechaInicio,
        endDate: visit.fechaFin,
        isCanceled: visit.esAnulado,
      })) : [],
      resources: instrument.recursos,
      isGia: instrument.esGia,
      giaTypeEnum: instrument.enuTipoGia,
      giaTypeDescription: instrument.tipoGiaDescripcion,
      code: instrument.codigo,
      name: instrument.nombre,
      stage: instrument.etapa,
      stageDescription: instrument.etapaDescripcion,
      modality: instrument.modalidad,
      modalityDescription: instrument.modalidadDescripcion,
      level: instrument.nivel,
      levelDescription: instrument.nivelDescripcion,
      cycle: instrument.ciclo,
      cycleDescription: instrument.cicloDescripcion,
      area: instrument.area,
      areaDescription: instrument.areaDescripcion,
      reference: instrument.referencia,
      isActive: instrument.esActivo,
      published: instrument.publicado,
      id: instrument.id,
      key: instrument.key,
      creationDate: instrument.fechaCreacion,
      modificationDate: instrument.fechaModificacion,
      createdBy: instrument.usuarioCreacion,
      modifiedBy: instrument.usuarioModificacion,
      inKey: instrument.inKey,
    };
  }

  /**
   * Mapea NestedPlanResponse a NestedPlan
   */
  static NestedPlanResponseToEntity(plan: NestedPlanResponse): NestedPlan {
    return {
      code: plan.codigo,
      name: plan.nombre,
      enuType: plan.enuTipo,
      typeDescription: plan.tipoDescripcion,
      dre: plan.dre ? MonitoringMapper.SitesResponseToEntity(plan.dre) : undefined,
      ugel: plan.ugel ? MonitoringMapper.SitesResponseToEntity(plan.ugel) : undefined,
      site: plan.sede ? MonitoringMapper.SitesResponseToEntity(plan.sede) : undefined,
      ugels: plan.ugels ? plan.ugels.map(MonitoringMapper.SitesResponseToEntity) : [],
      actors: plan.actores ? plan.actores.map(actor => ({
        id: actor.id,
        code: actor.codigo,
        value: actor.valor,
        name: actor.nombre,
      })) : [],
      idLogicalFramework: plan.idMarcoLogico,
      nameLogicalFramework: plan.marcoLogicoNombre,
      description: plan.descripcion,
      period: plan.periodo,
      stage: plan.etapa,
      stageDescription: plan.etapaDescripcion,
      mode: plan.modalidad,
      modeDescription: plan.modalidadDescripcion,
      startDate: plan.fechaInicio,
      endDate: plan.fechaFin,
      isActive: plan.esActivo,
      isFinish: plan.esCulminado,
      public: plan.publicado,
      components: plan.componentes ? plan.componentes.map(component => ({
        id: component.id,
        code: component.codigo,
        name: component.nombre,
        results: component.resultados ? component.resultados.map(result => ({
          id: result.id,
          componentId: result.idComponente,
          code: result.codigo,
          name: result.nombre,
          indicators: result.indicadores ? result.indicadores.map(indicator => ({
            id: indicator.id,
            componentId: indicator.idComponente,
            resultId: indicator.idResultado,
            code: indicator.codigo,
            name: indicator.nombre,
            aspects: indicator.aspectos ? indicator.aspectos.map(aspect => ({
              id: aspect.id,
              componentId: aspect.idComponente,
              resultId: aspect.idResultado,
              indicatorId: aspect.idIndicador,
              code: aspect.codigo,
              name: aspect.nombre,
              weighted: aspect.ponderado,
            })) : [],
          })) : [],
        })) : [],
      })) : [],
      id: plan.id,
      key: plan.key,
      creationDate: plan.fechaCreacion,
      modificationDate: plan.fechaModificacion,
      createdBy: plan.usuarioCreacion,
      modifiedBy: plan.usuarioModificacion,
      inKey: plan.inKey,
    };
  }

  /**
   * Convierte una entidad VisitAnswer a un objeto VisitAnswerResponse
   * @param visit Entidad VisitAnswer
   * @returns Objeto VisitAnswerResponse para enviar al backend
   */
  static VisitAnswerToResponse(visit: VisitAnswer): VisitAnswerResponse {
    return {
      id: visit.id,
      idMuestra: visit.sampleId,
      numeroVisita: visit.visitNumber,
      codigo: visit.code,
      enuTipoVisita: visit.visitType,
      tipoVisitaDescripcion: visit.visitTypeDescription,
      enuEstado: visit.status,
      aspectosCompletados: visit.completedAspects,
      seEncontroSujetoDeMonitoreo: visit.subjectFound,
      conReemplazo: visit.withReplacement,
      esReprogramada: visit.isRescheduled,
      fechaProgramacion: visit.scheduledDate,
      horaInicio: visit.startTime,
      horaFin: visit.endTime,
      datoAdicional: visit.additionalData,
      esReintegroDeEjecucion: visit.isExecutionAdjustment,
      fechaInicioEjecucion: visit.executionStartDate,
      horaInicioEjecucion: visit.executionStartTime,
      fechaCierreEjecucion: visit.executionEndDate,
      horaFinCierreEjecucion: visit.executionEndTime,
      esAnulado: visit.isCanceled,
      nombresAuxiliar: visit.auxiliaryFirstName,
      primerApellidoAuxiliar: visit.auxiliaryLastName,
      segundoApellidoAuxiliar: visit.auxiliaryMiddleName,
      observacion: visit.observation,
      compromisos: visit.commitments,
      enuTipoMonitor: visit.monitorType,
      tipoMonitorDescripcion: visit.monitorTypeDescription,
      monitorTipoDocumento: visit.monitorDocumentType,
      monitorNumeroDocumento: visit.monitorDocumentNumber,
      monitorNombres: visit.monitorFirstName,
      monitorPrimerApellido: visit.monitorLastName,
      monitorSegundoApellido: visit.monitorMiddleName,
      monitorSede: visit.monitorSite 
        ? MonitoringMapper.SiteEntityToSitesResponse(visit.monitorSite)
        : undefined,
      muestra: visit.sample as any, // Mantener como any para compatibilidad
      instrumento: visit.instrument as any, // Mantener como any para compatibilidad
      plan: visit.plan as any, // Mantener como any para compatibilidad
      errorEjecucion: visit.executionError,
      bitacora: visit.binnacle && visit.binnacle.length > 0 
        ? visit.binnacle.map(MonitoringMapper.EntityToBitacora) 
        : [],
    };
  }

  /**
   * Convierte un objeto BinnacleVisit a BitacoraVisita
   * @param binnacle Objeto BinnacleVisit
   * @returns Objeto BitacoraVisita para enviar al backend
   */
  static EntityToBitacora(binnacle: BinnacleVisit): BitacoraVisita {
    // Extraer valores seguros para el objeto Site
    const siteCode = binnacle.monitorSite?.code || '';
    const siteName = binnacle.monitorSite?.name || '';
    
    return {
      tipoBitacora: binnacle.binnacleType,
      seEncontroSujetoDeMonitoreo: binnacle.subjectFound,
      comentario: binnacle.comment,
      reprogramado: binnacle.rescheduled,
      tipoVisita: binnacle.visitType,
      linkReunion: binnacle.meetingLink,
      fechaVisita: binnacle.visitDate,
      tipoVisitaReprogramacion: binnacle.reschedulingVisitType,
      fechaVisitaReprogramacion: binnacle.reschedulingVisitDate,
      linkReunionReProgramacion: binnacle.reschedulingMeetingLink,
      enuTipoMonitor: binnacle.monitorType,
      tipoMonitorDescripcion: binnacle.monitorTypeDescription,
      monitorTipoDocumento: binnacle.monitorDocumentType,
      monitorNumeroDocumento: binnacle.monitorDocumentNumber,
      monitorNombres: binnacle.monitorFirstName,
      monitorPrimerApellido: binnacle.monitorLastName,
      monitorSegundoApellido: binnacle.monitorMiddleName,
      monitorSede: {
        codigoSede: siteCode,
        nombreSede: siteName,
        anexo: binnacle.monitorSite?.anexo,
        tipoSede: binnacle.monitorSite?.type?.toString(),
        tipoSedeIndice: binnacle.monitorSite?.typeIndex,
        tipoSedeDescripcion: binnacle.monitorSite?.roleName
      },
      nombresAuxiliar: binnacle.auxiliaryFirstName,
      primerApellidoAuxiliar: binnacle.auxiliaryLastName,
      segundoApellidoAuxiliar: binnacle.auxiliaryMiddleName,
      fechaCreacion: binnacle.creationDate,
    };
  }

  /**
   * Convierte una entidad Sample a NestedSampleResponse
   * @param sample Entidad Sample
   * @returns Objeto NestedSampleResponse para enviar al backend
   */
  static SampleToNestedSampleResponse(sample: Sample): NestedSampleResponse {
    return {
      idInstrumento: sample.idInstrument,
      idTipoMuestra: sample.idSampleType,
      tipoMuestraDescripcion: sample.sampleTypeDescription,
      tipoDocumento: sample.documentType,
      numeroDocumento: sample.documentNumber,
      nombres: sample.firstName,
      primerApellido: sample.lastName,
      segundoApellido: sample.middleName,
      sede: sample.site ? {
        codigoSede: sample.site.code,
        anexo: sample.site.anexo || '',
        nombreSede: sample.site.name,
        tipoSede: typeof sample.site.type === 'string' ? parseInt(sample.site.type) : sample.site.type,
        tipoSedeDescripcion: sample.site.roleName || '',
      } : {
        codigoSede: '',
        anexo: '',
        nombreSede: '',
        tipoSede: 0,
        tipoSedeDescripcion: '',
      },
      dre: sample.dre,
      dreDescripcion: sample.dreDescription,
      ugel: sample.ugel,
      ugelDescripcion: sample.ugelDescription,
      idNivel: sample.idLevel,
      nivelDescripcion: sample.levelDescription,
      red: sample.network,
      redDescripcion: sample.networkDescription,
      codigoModular: sample.modularCode,
      codigoLocal: undefined, // Campo no existe en Sample
      anexo: sample.anexo,
      iieeNombre: sample.iieeName,
      enuTipoMonitor: sample.monitorType,
      tipoMonitorDescripcion: sample.monitorTypeDescription,
      monitorTipoDocumento: sample.monitorDocumentType,
      monitorNumeroDocumento: sample.monitorDocumentNumber,
      monitorNombres: sample.monitorFirstName,
      monitorPrimerApellido: sample.monitorLastName,
      monitorSegundoApellido: sample.monitorMiddleName,
      monitorSede: sample.monitorSite ? {
        codigoSede: sample.monitorSite.code,
        anexo: sample.monitorSite.anexo || '',
        nombreSede: sample.monitorSite.name,
        tipoSede: typeof sample.monitorSite.type === 'string' ? parseInt(sample.monitorSite.type) : sample.monitorSite.type,
        tipoSedeDescripcion: sample.monitorSite.roleName,
      } : {
        codigoSede: '',
        anexo: '',
        nombreSede: '',
        tipoSede: 0,
        tipoSedeDescripcion: undefined,
      },
      visitas: sample.visits.map(visit => ({
        ...MonitoringMapper.VisitAnswerToResponse(visit),
        key: visit.id,
        fechaCreacion: visit.executionStartDate || new Date(),
        fechaModificacion: visit.executionEndDate,
        usuarioCreacion: undefined,
        usuarioModificacion: undefined,
        inKey: undefined,
      })),
      esActivo: sample.isActive,
      esAnulado: sample.isCanceled,
      esReemplazado: sample.isReplaced,
      reemplazo: sample.replacement,
      id: sample.id,
      key: sample.key,
      fechaCreacion: sample.creationDate,
      fechaModificacion: sample.modificationDate,
      usuarioCreacion: sample.createdBy,
      usuarioModificacion: sample.modifiedBy,
      inKey: sample.inKey,
    };
  }

  /**
   * Convierte una entidad MonitoringInstrument a NestedInstrumentResponse
   * @param instrument Entidad MonitoringInstrument
   * @returns Objeto NestedInstrumentResponse para enviar al backend
   */
  static MonitoringInstrumentToNestedInstrumentResponse(instrument: MonitoringInstrument): NestedInstrumentResponse {
    return {
      version: 0, // Por defecto
      idPlanMonitoreo: instrument.monitoringPlanId,
      enuMonitores: instrument.monitorsEnums,
      monitores: [],
      enuMuestra: instrument.sampleEnum,
      muestraDescripcion: instrument.sampleDescription,
      enuTipo: instrument.typeEnum,
      tipoDescripcion: instrument.typeDescription,
      componente: instrument.component,
      resultado: instrument.result,
      indicador: instrument.indicator,
      aspectos: instrument.aspects.map(aspect => ({
        id: aspect.id,
        idComponente: aspect.componentId,
        idResultado: aspect.resultId,
        idIndicador: aspect.indicatorId,
        codigo: aspect.code,
        nombre: aspect.name,
        ponderado: aspect.weighted,
      })),
      visitas: instrument.visits.map(visit => ({
        numeroVisita: visit.visitNumber,
        codigo: visit.code,
        fechaInicio: visit.startDate,
        fechaFin: visit.endDate,
        esAnulado: visit.isCanceled,
      })),
      recursos: instrument.resources,
      esGia: instrument.isGia,
      enuTipoGia: instrument.giaTypeEnum || undefined,
      tipoGiaDescripcion: instrument.giaTypeDescription || undefined,
      codigo: instrument.code,
      nombre: instrument.name,
      etapa: instrument.stage,
      etapaDescripcion: instrument.stageDescription,
      modalidad: instrument.modality,
      modalidadDescripcion: instrument.modalityDescription,
      nivel: instrument.level,
      nivelDescripcion: instrument.levelDescription || undefined,
      ciclo: instrument.cycle,
      cicloDescripcion: instrument.cycleDescription || undefined,
      area: instrument.area,
      areaDescripcion: instrument.areaDescription || undefined,
      referencia: instrument.reference,
      esActivo: instrument.isActive,
      publicado: instrument.published,
      id: instrument.id,
      key: instrument.key,
      fechaCreacion: instrument.creationDate,
      fechaModificacion: undefined, // Campo no existe en MonitoringInstrument
      usuarioCreacion: undefined, // Campo no existe en MonitoringInstrument
      usuarioModificacion: undefined, // Campo no existe en MonitoringInstrument
      inKey: undefined, // Campo no existe en MonitoringInstrument
      aplicaTodosDocentes: instrument.appliesToAllTeachers,
      esAutoevaluacionDelDocentes: instrument.isAutoevaluationOfTeachers,
    };
  }

  /**
   * Convierte una entidad MonitoringPlan a NestedPlanResponse
   * @param plan Entidad MonitoringPlan
   * @returns Objeto NestedPlanResponse para enviar al backend
   */
  static MonitoringPlanToNestedPlanResponse(plan: MonitoringPlan): NestedPlanResponse {
    return {
      codigo: plan.code,
      nombre: plan.name,
      enuTipo: plan.enuType,
      tipoDescripcion: plan.typeDescription,
      dre: plan.dre ? MonitoringMapper.SiteEntityToSitesResponse(plan.dre) : undefined,
      ugel: plan.ugel ? MonitoringMapper.SiteEntityToSitesResponse(plan.ugel) : undefined,
      sede: MonitoringMapper.SiteEntityToSitesResponse(plan.site),
      ugels: plan.ugels.map(MonitoringMapper.SiteEntityToSitesResponse),
      actores: plan.actors,
      idMarcoLogico: plan.idLogicalFramework,
      marcoLogicoNombre: plan.nameLogicalFramework,
      descripcion: plan.description,
      periodo: plan.period,
      etapa: plan.stage,
      etapaDescripcion: plan.stageDescription,
      modalidad: plan.mode,
      modalidadDescripcion: plan.modeDescription,
      fechaInicio: plan.startDate,
      fechaFin: plan.endDate,
      esActivo: plan.isActive,
      esCulminado: plan.isFinish,
      publicado: plan.public,
      componentes: [], // Por ahora vacío, se puede expandir si es necesario
      id: plan.id,
      key: plan.key,
      fechaCreacion: new Date(), // Por defecto
      fechaModificacion: new Date(), // Por defecto
      usuarioCreacion: '',
      usuarioModificacion: '',
      inKey: undefined,
    };
  }

  /**
   * Mapea ItemOptionResponse a ItemOption
   */
  static ItemOptionResponseToEntity(option: ItemOptionResponse): ItemOption {
    return {
      code: option.code,
      title: option.title,
      withDescription: option.withDescription,
      description: option.description,
      value: option.value,
      score: option.score,
      scoreMin: option.scoreMin,
      scoreMax: option.scoreMax,
      order: option.order,
      isCorrect: option.isCorrect,
      isOther: option.isOther,
      format: option.formart, // Nota: el JSON tiene "formart" (typo)
    };
  }

  /**
   * Mapea ItemConfigurationResponse a ItemConfiguration
   */
  static ItemConfigurationResponseToEntity(config: ItemConfigurationResponse): ItemConfiguration {
    return {
      multipleAnswers: config.multipleAswers, // Nota: el JSON tiene "multipleAswers" (typo)
      multipleOptions: config.multipleOptions,
      instructions: config.instructions,
      typeOption: config.typeOption,
      skipQuestion: config.skipQuestion,
      otherOption: config.otherOption,
      score: config.score,
      textArea: config.textArea,
      intervalScore: config.intervalScore,
    };
  }

  /**
   * Mapea ItemResolveResponse a ItemResolve
   */
  static ItemResolveResponseToEntity(resolve: ItemResolveResponse): ItemResolve {
    return {
      order: resolve.order,
      title: resolve.title,
      options: resolve.options ? resolve.options.map(MonitoringMapper.ItemOptionResponseToEntity) : [],
      withInstructions: resolve.withInstructions,
      instructions: resolve.instructions,
      withMultipleAnswers: resolve.withMultipleAnswers,
      withMultipleOptions: resolve.withMultipleOptions,
      typeOption: resolve.typeOption,
      withSkipQuestion: resolve.withSkipQuestion,
      withOtherOption: resolve.withOtherOption,
      isTextArea: resolve.isTextArea,
      withOnlyDate: resolve.withOnlyDate,
      formatOtherOption: resolve.formatOtherOption,
      withScore: resolve.withScore,
    };
  }

  /**
   * Mapea ItemTypeResponse a ItemType
   */
  static ItemTypeResponseToEntity(itemType: ItemTypeResponse): ItemType {
    return {
      type: itemType.type,
      name: itemType.name,
      configuration: MonitoringMapper.ItemConfigurationResponseToEntity(itemType.configuration),
      resolve: MonitoringMapper.ItemResolveResponseToEntity(itemType.resolve),
      answer: itemType.answer,
    };
  }

  /**
   * Mapea ItemRuleResponse a ItemRule
   */
  static ItemRuleResponseToEntity(rule: ItemRuleResponse): ItemRule {
    return {
      required: rule.required,
      itsDependent: rule.itsDependent, // Nota: el JSON tiene "itsDependent"
      rules: rule.rules,
    };
  }

  /**
   * Mapea InstrumentItemResponse a InstrumentItem
   */
  static InstrumentItemResponseToEntity(item: InstrumentItemResponse): InstrumentItem {
    return {
      id: item.id,
      instrumentId: item.idInstrumento,
      itemId: item.idItem,
      aspectId: item.idAspecto,
      title: item.titulo,
      code: item.codigo,
      tags: item.etiquetas || [],
      order: item.orden,
      configuration: MonitoringMapper.ItemTypeResponseToEntity(item.configuracion),
      rules: MonitoringMapper.ItemRuleResponseToEntity(item.reglas),
    };
  }
}
