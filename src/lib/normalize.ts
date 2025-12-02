/**
 * Normaliza texto para búsqueda sin tildes ni caracteres especiales
 * Elimina acentos, convierte a minúsculas y limpia caracteres extraños
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (tildes)
    .replace(/[,\s-]+/g, ' ') // Reemplaza comas, espacios múltiples y guiones por un solo espacio
    .replace(/[^\w\s]/g, '') // Elimina caracteres especiales excepto letras, números y espacios
    .trim();
};

/**
 * Crea un mapa de cache para búsquedas normalizadas optimizadas
 */
export const createNormalizedCache = () => {
  const cache = new Map<string, string>();

  return {
    get: (text: string): string | undefined => cache.get(text),
    set: (text: string, normalized: string): void => {
      // Limitar cache size para evitar memory leaks
      if (cache.size > 1000) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }
      cache.set(text, normalized);
    },
    has: (text: string): boolean => cache.has(text),
    clear: (): void => cache.clear(),
    size: (): number => cache.size
  };
};

// Cache global para normalización de texto
export const textNormalizationCache = createNormalizedCache();

/**
 * Función optimizada con cache para normalizar texto
 */
export const cachedNormalizeText = (text: string): string => {
  if (textNormalizationCache.has(text)) {
    return textNormalizationCache.get(text)!;
  }

  const normalized = normalizeText(text);
  textNormalizationCache.set(text, normalized);
  return normalized;
};