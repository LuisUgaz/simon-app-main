import {
  ROLE_SPECIALIST_MINEDU,
  ROLE_SPECIALIST_DRE,
  ROLE_SPECIALIST_UGEL,
  ROLE_DIRECTOR_IIEE,
  ROLE_TEACHER_IIEE
} from './roles.constanst';
export const ENUMS = {
  configuracion: {
    tipoPlanMonitoreo: {
      tipo: 'TIPO_PLAN_MONITOREO',
      children: {
        nacional: '5efe2e9ba4061270f0d55e4a',
        regional: '5efe2e9ba4061270f0d55e4b',
        local: '5efe2e9ba4061270f0d55e4c',
        iiee: '5efe2e9ba4061270f0d55e4d',
      },
      descriptions: {
        '5efe2e9ba4061270f0d55e4a': 'Nacional',
        '5efe2e9ba4061270f0d55e4b': 'Regional',
        '5efe2e9ba4061270f0d55e4c': 'Local',
        '5efe2e9ba4061270f0d55e4d': 'IIEE',
      } as Record<string, string>,
    },
    tipoActor: {
      tipo: 'TIPO_ACTOR',
      children: {
        especialistaMINEDU: '5efe3093322fdc5bd073285e',
        especialistaDRE: '5efe309f322fdc5bd073285f',
        especialistaUGEL: '5efe30a9322fdc5bd0732860',
        directorIE: '5efe30c1322fdc5bd0732861',
        docente: '5efe30d9322fdc5bd0732862',
        directorCETPRO: '5efe3163322fdc5bd0732863',
        directorSUPERIOR: '5efe3173322fdc5bd0732864',
      },
      descriptions: {
        '5efe3093322fdc5bd073285e': 'Especialista MINEDU',
        '5efe309f322fdc5bd073285f': 'Especialista DRE',
        '5efe30a9322fdc5bd0732860': 'Especialista UGEL',
        '5efe30c1322fdc5bd0732861': 'Director',
        '5efe30d9322fdc5bd0732862': 'Docente',
        '5efe3163322fdc5bd0732863': 'Director CETPRO',
        '5efe3173322fdc5bd0732864': 'Director SUPERIOR',
      } as Record<string, string>,
    },
    tipoInstrumento: {
      tipo: 'TIPO_INSTRUMENTO',
      children: {
        fichaObservacion: '5f07609b8a654d8f4112ad10',
        encuesta: '5f0760a78a654d8f4112ad11',
        listaCotejo: '5f0760be8a654d8f4112ad12',
      },
      descriptions: {
        '5f07609b8a654d8f4112ad10': 'Ficha de Observación',
        '5f0760a78a654d8f4112ad11': 'Encuesta',
        '5f0760be8a654d8f4112ad12': 'Lista de Cotejo',
      } as Record<string, string>,
    },
    tipoGia: {
      tipo: 'TIPO_GIA',
      children: {
        Institucional: '60a9db586f0c42fccd54ce95',
        Interinstitucional: '60a9db5e0037451c60c85bcc',
      },
      descriptions: {
        '60a9db586f0c42fccd54ce95': 'Institucional',
        '60a9db5e0037451c60c85bcc': 'Interinstitucional',
      } as Record<string, string>,
    },
    tipoEstadoVisita: {
      tipo: 'TIPO_ESTADO_VISITA',
      children: {
        asignado: '5f44626229155ede050b6626',
        programado: '5f44628629155ede050b6627',
        enEjecucion: '5f44629429155ede050b6628',
        enProcesoCierre: '5f44632129155ede050b6629',
        ejecutado: '5f44635329155ede050b662a',
        envioConError: '5f44636629155ede050b662b',
        noEjecutado: '5f44637a29155ede050b662c',
        culminadoSinEjecucion: '5f482b0e623976b26a35e8a6',
      },
      descriptions: {
        '5f44626229155ede050b6626': 'Sin Programar',
        '5f44628629155ede050b6627': 'Programado',
        '5f44629429155ede050b6628': 'En Ejecución',
        '5f44632129155ede050b6629': 'En Proceso de Cierre',
        '5f44635329155ede050b662a': 'Ejecutado',
        '5f44636629155ede050b662b': 'Envío con Error',
        '5f44637a29155ede050b662c': 'No Ejecutado',
        '5f482b0e623976b26a35e8a6': 'Culminado sin Ejecución',
      } as Record<string, string>,
    },
    tipoVisita: {
      tipo: 'TIPO_VISITA',
      children: {
        presencial: '5f46acafd44f69c9bb381a89',
        virtual: '5f46acd0d44f69c9bb381a8a',
        telefonico: '5f46ad0fd44f69c9bb381a8b',
      },
      descriptions: {
        '5f46acafd44f69c9bb381a89': 'Presencial',
        '5f46acd0d44f69c9bb381a8a': 'Virtual',
        '5f46ad0fd44f69c9bb381a8b': 'Telefónico',
      } as Record<string, string>,
    },
  },
};

export const BUSINESS_RULES = {
  rolActorRelations: [
    // esta configuración contiene la asociación de los roles de passport con los actores del sistema
    {
      rol: ROLE_SPECIALIST_MINEDU,
      actor: ENUMS.configuracion.tipoActor.children.especialistaMINEDU,
    },
    {
      rol: ROLE_SPECIALIST_DRE,
      actor: ENUMS.configuracion.tipoActor.children.especialistaDRE,
    },
    {
      rol: ROLE_SPECIALIST_UGEL,
      actor: ENUMS.configuracion.tipoActor.children.especialistaUGEL,
    },
    {
      rol: ROLE_DIRECTOR_IIEE,
      actor: ENUMS.configuracion.tipoActor.children.directorIE,
    },
    {
      rol: ROLE_TEACHER_IIEE,
      actor: ENUMS.configuracion.tipoActor.children.docente,
    }
  ],
  visitStatusColors: [
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.asignado,
      color: '#f3f4f6',
    },
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.programado,
      color: '#06b6d4',
    },
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.enEjecucion,
      color: '#6b7280',
    },
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.enProcesoCierre,
      color: '#f59e0b',
    },
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.ejecutado,
      color: '#22c55e',
    },
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.envioConError,
      color: '#f59e0b',
    },
    {
      status: ENUMS.configuracion.tipoEstadoVisita.children.noEjecutado,
      color: '#ef4444',
    },
    {
      status:
        ENUMS.configuracion.tipoEstadoVisita.children.culminadoSinEjecucion,
      color: '#f97316',
    },
  ],
};
