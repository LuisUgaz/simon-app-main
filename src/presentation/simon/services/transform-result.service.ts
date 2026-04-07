import { InstrumentItem, ItemOption } from '../../../core/entities';
import { QUESTION_TYPES } from './config';

export interface VisitaRespuesta {
  idAspecto?: string;
  idVisitaMuestra?: string;
  idItemInstrumento?: string;
  descripcionValor?: string;
  comentario?: string;
  opcionSeleccionada?: string;
  aspectoDescripcion?: string;
  itemDescripcion?: string;
  tipoItem?: string;
  tipoItemDescripcion?: string;
  codigoAspecto?: string;
  apply?: boolean;
  
  // Para TYPE_01 (Opción múltiple)
  conPuntaje?: boolean;
  puntajeObtenido?: number;
  marcoRespuestaCorrecta?: boolean;
  conOtros?: boolean;
  tipoFormatoOtros?: string;
  otrosFecha?: string;
  otrosNumero?: number;
  otrosSimple?: string;
  
  // Para TYPE_02 (Casillas de verificación)
  valorMultipleCadena?: string[];
  valorMultipleCadenaConcatenada?: string;
  valorMultipleCadenaCantidad?: number;
  valorMultipleCadenaCantidadSinOtros?: number;
  valorMultipleCadenaTodas?: boolean;
  
  // Para TYPE_03 (Ranking de estrellas)
  cantidadEstrellas?: number;
  marcoValorMaximo?: boolean;
  marcoValorMinimo?: boolean;
  
  // Para TYPE_04 (Carga de archivos)
  valorArchivoCodigo?: string;
  valorArchivoPeso?: string;
  valorArchivoExtension?: string;
  valorFileName?: string;
  
  // Para TYPE_05 y TYPE_06 (Texto)
  cantidadPalabras?: number;
  
  // Para TYPE_07 (Cantidad)
  descripcionRango?: string;
  marcoValorMinimoRango?: boolean;
  marcoValorMaximoRango?: boolean;
  valorCantidad?: number;
  
  // Para TYPE_08 (Fecha)
  valorFecha?: Date;
  valorFechaDia?: number;
  valorFechaMes?: number;
  valorFechaAnio?: number;
  valorFechaMesNombre?: string;
  valorFechaDiaNombre?: string;
}

export interface VisitaRespuestaContainer {
  respuestas: VisitaRespuesta[];
  idAspecto: string;
  idVisitaMuestra: string;
}

export class TransformResultService {
  
  /**
   * Convierte las keys del formResult de formato con guiones bajos a formato con puntos
   * Solo convierte los primeros 2 guiones bajos del código, mantiene sufijos como _other, _comment
   */
  private static convertFormResultKeys(formResult: any): any {
    const convertedResult: any = {};
    
    Object.keys(formResult).forEach(key => {
      // Convertir solo los primeros 2 guiones bajos por puntos (C-01_AR01_IT01 → C-01.AR01.IT01)
      // Pero mantener sufijos intactos (_other, _comment, etc.)
      let convertedKey = key;
      
      // Encontrar los primeros 2 guiones bajos y reemplazarlos por puntos
      let underscoreCount = 0;
      convertedKey = key.replace(/_/g, (match) => {
        underscoreCount++;
        if (underscoreCount <= 2) {
          return '.';
        }
        return match; // Mantener guiones bajos posteriores
      });
      
      convertedResult[convertedKey] = formResult[key];
      console.log(`🔄 Key conversion: ${key} → ${convertedKey}`);
    });
    
    return convertedResult;
  }
  
  static transformToVisitResult(item: InstrumentItem, formResult: any): VisitaRespuesta | null {
    // Convertir las keys del formResult al formato esperado (guiones bajos → puntos)
    const convertedFormResult = this.convertFormResultKeys(formResult);
    
    // Usar el código original del item para buscar en el formResult convertido
    const fieldKey = item.code;
    
    console.log(`🔄 Transformando item ${item.code}, tipo: ${item.configuration.type}`);
    console.log(`🔍 Buscando campo: ${fieldKey} en formResult convertido:`, Object.keys(convertedFormResult));
    
    switch (item.configuration.type) {
      case 'TYPE_01': // Opción múltiple
        return this.transformOpcionMultiple(item, convertedFormResult, fieldKey);
      case 'TYPE_02': // Casillas de verificación
        return this.transformCasillaVerificacion(item, convertedFormResult, fieldKey);
      case 'TYPE_03': // Ranking de estrellas
        return this.transformRankingEstrella(item, convertedFormResult, fieldKey);
      case 'TYPE_04': // Carga de archivos
        return this.transformCargaArchivo(item, convertedFormResult, fieldKey);
      case 'TYPE_05': // Cuadro de texto simple
        return this.transformCuadroTextoSimple(item, convertedFormResult, fieldKey);
      case 'TYPE_06': // Cuadro de comentario
        return this.transformCuadroComentario(item, convertedFormResult, fieldKey);
      case 'TYPE_07': // Cantidad
        return this.transformCantidad(item, convertedFormResult, fieldKey);
      case 'TYPE_08': // Fecha y hora
        return this.transformFecha(item, convertedFormResult, fieldKey);
      default:
        console.warn(`Tipo de pregunta no soportado: ${item.configuration.type}`);
        return null;
    }
  }
  
  private static transformOpcionMultiple(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const codeOption = formResult[fieldKey];
    if (!codeOption) {
      console.log(`❌ No se encontró valor para campo ${fieldKey}`);
      return null;
    }

    console.log(`✅ Valor encontrado para ${fieldKey}:`, codeOption);

    let opcion: ItemOption | null = null;
    const withOther = codeOption === 'OTHER';
    
    if (!withOther) {
      opcion = item.configuration.resolve.options.find(x => x.code === codeOption) || null;
    }

    const result: VisitaRespuesta = {};
    result.descripcionValor = withOther 
      ? formResult[`${fieldKey}_other`] || ''
      : (opcion?.title || '');
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    
    if (item.configuration.resolve.withScore) {
      result.conPuntaje = true;
      result.puntajeObtenido = withOther ? 0 : (opcion?.score || 0);
      result.marcoRespuestaCorrecta = opcion?.isCorrect || false;
    }

    if (withOther) {
      result.conOtros = true;
      result.tipoFormatoOtros = item.configuration.resolve.formatOtherOption;
      const otherValue = formResult[`${fieldKey}_other`];
      
      switch (item.configuration.resolve.formatOtherOption) {
        case 'DATE':
          result.otrosFecha = otherValue;
          break;
        case 'NUMBER':
          result.otrosNumero = Number(otherValue);
          break;
        case 'TEXT':
          result.otrosSimple = otherValue;
          break;
      }
    }

    result.opcionSeleccionada = codeOption;
    return result;
  }
  
  private static transformCasillaVerificacion(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const codeOptions: string[] = formResult[fieldKey];
    if (!codeOptions || !Array.isArray(codeOptions)) {
      return null;
    }

    let opciones: ItemOption[] = [];
    const withOther = codeOptions.some(x => x === 'OTHER');
    opciones = item.configuration.resolve.options.filter(x => 
      codeOptions.some(y => y === x.code)
    );

    const result: VisitaRespuesta = {};
    
    // Construir descripción del valor
    const optionTitles = opciones.map(x => x.title);
    const otherText = formResult[`${fieldKey}_other`] || '';
    
    if (withOther) {
      result.descripcionValor = optionTitles.length === 0 
        ? otherText 
        : `${optionTitles.join(', ')}, ${otherText}`;
    } else {
      result.descripcionValor = optionTitles.join(', ');
    }
    
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    
    if (item.configuration.resolve.withScore) {
      result.conPuntaje = true;
      result.puntajeObtenido = opciones.reduce((a, b) => a + (b.score || 0), 0);
      result.marcoRespuestaCorrecta = opciones.some(x => x.isCorrect);
    }

    if (withOther) {
      result.conOtros = true;
      result.tipoFormatoOtros = item.configuration.resolve.formatOtherOption;
      const otherValue = formResult[`${fieldKey}_other`];
      
      switch (item.configuration.resolve.formatOtherOption) {
        case 'DATE':
          result.otrosFecha = otherValue;
          break;
        case 'NUMBER':
          result.otrosNumero = Number(otherValue);
          break;
        case 'TEXT':
          result.otrosSimple = otherValue;
          break;
      }
    }

    // Propiedades específicas para casillas de verificación
    result.valorMultipleCadena = codeOptions;
    result.valorMultipleCadenaConcatenada = result.descripcionValor || '';
    result.valorMultipleCadenaCantidad = codeOptions.length;
    result.valorMultipleCadenaCantidadSinOtros = codeOptions.filter(x => x !== 'OTHER').length;
    result.valorMultipleCadenaTodas = codeOptions.length >= item.configuration.resolve.options.length;
    
    return result;
  }
  
  private static transformRankingEstrella(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const codeOption = formResult[fieldKey];
    if (!codeOption) {
      return null;
    }

    // Para ranking de estrellas, el valor es el número de estrellas
    const numStars = Number(codeOption);
    const opcion = item.configuration.resolve.options.find(x => x.score === numStars);

    const result: VisitaRespuesta = {};
    result.descripcionValor = opcion?.title || `${numStars} estrellas`;
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    result.conPuntaje = item.configuration.resolve.withScore;
    
    if (result.conPuntaje) {
      result.puntajeObtenido = numStars;
      result.marcoRespuestaCorrecta = opcion?.isCorrect || false;
    }
    console.log('ranking estrellas codeOption', opcion, codeOption);
    result.opcionSeleccionada = opcion?.code || '';
    result.cantidadEstrellas = numStars;
    
    // Determinar si es el valor máximo o mínimo
    const maxScore = Math.max(...item.configuration.resolve.options.map(x => x.score || 0));
    const minScore = Math.min(...item.configuration.resolve.options.map(x => x.score || 0));
    result.marcoValorMaximo = numStars === maxScore;
    result.marcoValorMinimo = numStars === minScore;
    
    return result;
  }
  
  private static transformCargaArchivo(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const fileCode = formResult[fieldKey];
    if (!fileCode) {
      return null;
    }

    const result: VisitaRespuesta = {};
    result.descripcionValor = fileCode;
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    result.valorArchivoCodigo = fileCode;
    result.valorArchivoPeso = formResult[`${fieldKey}_size`] || '';
    result.valorArchivoExtension = formResult[`${fieldKey}_extension`] || '';
    result.valorFileName = formResult[`${fieldKey}_filename`] || '';
    
    return result;
  }
  
  private static transformCuadroTextoSimple(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const value = formResult[fieldKey];
    if (!value) {
      return null;
    }

    const result: VisitaRespuesta = {};
    result.descripcionValor = value || "ㅤ"; // Usar carácter especial si está vacío
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    result.cantidadPalabras = (result.descripcionValor || '').split(' ').length;
    
    return result;
  }
  
  private static transformCuadroComentario(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const value = formResult[fieldKey];

    const result: VisitaRespuesta = {};
    result.descripcionValor = value || "ㅤ"; // Usar carácter especial si está vacío
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    result.cantidadPalabras = result.descripcionValor ? result.descripcionValor.split(' ').length : 0;
    
    return result;
  }
  
  private static transformCantidad(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const value = Number(formResult[fieldKey]);
    if (!value) {
      return null;
    }

    const result: VisitaRespuesta = {};
    result.descripcionValor = value.toString();
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    result.valorCantidad = value;
    
    const withScore = item.configuration.resolve.withScore;
    if (withScore) {
      const rangeOption = item.configuration.resolve.options.find(x => 
        value > Number(x.scoreMin || 0) && value <= Number(x.scoreMax || 0)
      );

      if (rangeOption) {
        result.descripcionRango = `mayor a ${rangeOption.scoreMin} menor igual a ${rangeOption.scoreMax}`;
        result.opcionSeleccionada = rangeOption.code;
        result.conPuntaje = true;
        result.puntajeObtenido = rangeOption.score || 0;
        result.marcoRespuestaCorrecta = rangeOption.isCorrect || false;
        result.marcoValorMinimoRango = Number(rangeOption.scoreMin) === value;
        result.marcoValorMaximoRango = Number(rangeOption.scoreMax) === value;

        // Determinar valores máximo y mínimo globales
        const allOptions = item.configuration.resolve.options;
        const maxRange = Math.max(...allOptions.map(x => Number(x.scoreMax || 0)));
        const minRange = Math.min(...allOptions.map(x => Number(x.scoreMin || 0)));
        result.marcoValorMaximo = value === maxRange;
        result.marcoValorMinimo = value === minRange;
      }
    }
    
    return result;
  }
  
  private static transformFecha(item: InstrumentItem, formResult: any, fieldKey: string): VisitaRespuesta | null {
    const value = new Date(formResult[fieldKey]);
    if (!value || isNaN(value.getTime())) {
      return null;
    }

    const result: VisitaRespuesta = {};
    result.descripcionValor = value.toLocaleDateString('es-PE');
    result.comentario = formResult[`${fieldKey}_comment`] || '';
    result.valorFecha = value;
    result.valorFechaDia = value.getDate();
    result.valorFechaMes = value.getMonth();
    result.valorFechaAnio = value.getFullYear();
    
    // Nombres en español (simplificado)
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    result.valorFechaMesNombre = meses[value.getMonth()];
    result.valorFechaDiaNombre = dias[value.getDay()];
    
    const withScore = item.configuration.resolve.withScore;
    if (withScore) {
      const rangeOption = item.configuration.resolve.options.find(x => {
        const minDate = new Date(x.scoreMin || '');
        const maxDate = new Date(x.scoreMax || '');
        return value.getTime() > minDate.getTime() && value.getTime() <= maxDate.getTime();
      });

      if (rangeOption) {
        result.descripcionRango = `mayor a ${new Date(rangeOption.scoreMin || '').toLocaleDateString('es-PE')} menor igual a ${new Date(rangeOption.scoreMax || '').toLocaleDateString('es-PE')}`;
        result.opcionSeleccionada = rangeOption.code;
        result.conPuntaje = true;
        result.puntajeObtenido = rangeOption.score || 0;
        result.marcoRespuestaCorrecta = rangeOption.isCorrect || false;
        
        const minDate = new Date(rangeOption.scoreMin || '');
        const maxDate = new Date(rangeOption.scoreMax || '');
        result.marcoValorMinimoRango = minDate.getTime() === value.getTime();
        result.marcoValorMaximoRango = maxDate.getTime() === value.getTime();
      }
    }
    
    return result;
  }

  /**
   * Transforma una respuesta de visita a formato de formulario para cargar datos existentes
   */
  static structureFromResult(item: InstrumentItem, result: VisitaRespuesta): any {
    if (!result) {
      return null;
    }

    switch (item.configuration.type) {
      case QUESTION_TYPES.multipleOpcion:
        return this.structureFromResultOpcionMultiple(item, result);
      case QUESTION_TYPES.casillaVerificacion:
        return this.structureFromResultCasillaVerificacion(item, result);
      case QUESTION_TYPES.rankinkEstrella:
        return this.structureFromResultRankingEstrella(item, result);
      case QUESTION_TYPES.cargaArchivos:
        return this.structureFromResultCargaArchivo(item, result);
      case QUESTION_TYPES.cuadroTextoSimple:
        return this.structureFromResultCuadroTextoSimple(item, result);
      case QUESTION_TYPES.cuadroComentario:
        return this.structureFromResultCuadroComentario(item, result);
      case QUESTION_TYPES.Cantidad:
        return this.structureFromResultCantidad(item, result);
      case QUESTION_TYPES.FechaHora:
        return this.structureFromResultFecha(item, result);
      default:
        return null;
    }
  }

  private static structureFromResultOpcionMultiple(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.opcionSeleccionada;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    if (result.conOtros && result.opcionSeleccionada === 'OTHER') {
      switch (result.tipoFormatoOtros) {
        case 'TEXT':
          formData[`${fieldKey}_other`] = result.otrosSimple;
          break;
        case 'NUMBER':
          formData[`${fieldKey}_other`] = result.otrosNumero;
          break;
        case 'DATE':
          formData[`${fieldKey}_other`] = result.otrosFecha;
          break;
      }
    }
    
    return formData;
  }

  private static structureFromResultCasillaVerificacion(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.valorMultipleCadena || [];
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    if (result.conOtros && result.valorMultipleCadena?.includes('OTHER')) {
      switch (result.tipoFormatoOtros) {
        case 'TEXT':
          formData[`${fieldKey}_other`] = result.otrosSimple;
          break;
        case 'NUMBER':
          formData[`${fieldKey}_other`] = result.otrosNumero;
          break;
        case 'DATE':
          formData[`${fieldKey}_other`] = result.otrosFecha;
          break;
      }
    }
    
    return formData;
  }

  private static structureFromResultRankingEstrella(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.cantidadEstrellas?.toString() || result.opcionSeleccionada;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    return formData;
  }

  private static structureFromResultCargaArchivo(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.valorArchivoCodigo;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    if (result.valorArchivoPeso) {
      formData[`${fieldKey}_size`] = result.valorArchivoPeso;
    }
    
    if (result.valorArchivoExtension) {
      formData[`${fieldKey}_extension`] = result.valorArchivoExtension;
    }
    
    if (result.valorFileName) {
      formData[`${fieldKey}_filename`] = result.valorFileName;
    }
    
    return formData;
  }

  private static structureFromResultCuadroTextoSimple(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.descripcionValor === "ㅤ" ? "" : result.descripcionValor;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    return formData;
  }

  private static structureFromResultCuadroComentario(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.descripcionValor === "ㅤ" ? "" : result.descripcionValor;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    return formData;
  }

  private static structureFromResultCantidad(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.valorCantidad;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    return formData;
  }

  private static structureFromResultFecha(item: InstrumentItem, result: VisitaRespuesta): any {
    const fieldKey = item.code.replace(/\./g, '_');
    const formData: any = {};
    
    formData[fieldKey] = result.valorFecha;
    
    if (result.comentario) {
      formData[`${fieldKey}_comment`] = result.comentario;
    }
    
    return formData;
  }

  /**
   * Transforma un array de respuestas de visita a formato de formulario
   * Similar a fnTransformToFormFromResult del código de referencia
   */
  static transformToFormFromResult(items: InstrumentItem[], visitaRespuestas: VisitaRespuesta[]): any {
    let formValues: any = {};
    
    items.forEach((item: InstrumentItem) => {
      const result = visitaRespuestas.find(x => x.idItemInstrumento === item.id);
      if (result) {
        const structuredResult = this.structureFromResult(item, result);
        
        if (structuredResult) {
          // Usar merge simple para combinar los valores
          formValues = { ...formValues, ...structuredResult };
        }
      }
    });
    
    console.log('📋 Datos transformados para formulario:', formValues);
    return formValues;
  }
} 