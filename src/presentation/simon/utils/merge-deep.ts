/**
 * Realiza una fusión profunda de objetos
 * @param target Objeto destino
 * @param sources Objetos fuente para fusionar
 * @returns Objeto fusionado
 */
export function mergeDeep(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Verifica si un valor es un objeto
 * @param item Valor a verificar
 * @returns Verdadero si es un objeto
 */
function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
} 