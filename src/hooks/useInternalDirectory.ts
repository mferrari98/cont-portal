import { useState, useMemo, useCallback } from 'react';
import type * as XLSX from 'xlsx';
import { cachedNormalizeText } from '@/lib/normalize';
import type { Personnel, DepartmentGroup, SearchState } from '@/types/personnel';

type XLSXModule = typeof import('xlsx');

let xlsxModule: XLSXModule | null = null;

async function getXlsxModule(): Promise<XLSXModule> {
  if (!xlsxModule) {
    xlsxModule = await import('xlsx');
  }

  return xlsxModule;
}

const DIRECTORY_MAX_ROWS = 800;
const DIRECTORY_MAX_COLUMNS = 8; // A-H
const HEADER_SCAN_ROWS = 20;
const STOP_TOKEN_NORMALIZED = (
  ['telefonos internos reserva', 'reserva 6000'] as const
).map(token => cachedNormalizeText(token));

const HEADER_TOKENS = {
  extension: ['interno', 'internos', 'extension', 'ext', 'anexo', 'telefono', 'telefonos', 'int'],
  department: ['sector', 'departamento', 'area', 'unidad', 'seccion'],
  title: ['titulo', 'cargo', 'puesto', 'funcion'],
  name: ['apellido y nombre', 'apellidos y nombres', 'apellido', 'nombre', 'responsable', 'contacto']
} as const;

const DEFAULT_COLUMN_INDICES = {
  extension: 1,
  department: 2,
  title: 3,
  name: 4
} as const;

type ColumnMap = {
  extensionIndex: number;
  departmentIndex: number;
  titleIndex: number;
  nameIndex: number;
};

function buildWorksheetRange(worksheet: XLSX.WorkSheet, xlsx: XLSXModule): string {
  const baseRange = worksheet['!ref']
    ? xlsx.utils.decode_range(worksheet['!ref'])
    : xlsx.utils.decode_range(`A1:E${DIRECTORY_MAX_ROWS}`);

  const normalizedRange = {
    s: { c: 0, r: 0 },
    e: {
      c: Math.min(baseRange.e.c, DIRECTORY_MAX_COLUMNS - 1),
      r: Math.min(baseRange.e.r, DIRECTORY_MAX_ROWS - 1)
    }
  };

  return xlsx.utils.encode_range(normalizedRange);
}

function shouldStopProcessing(values: string[], hasName: boolean, hasNumericExtension: boolean): boolean {
  if (hasName || hasNumericExtension) return false;
  return values.some(value => {
    if (!value) return false;
    const normalized = cachedNormalizeText(value);
    return normalized.length > 0 && STOP_TOKEN_NORMALIZED.some(token => normalized.includes(token));
  });
}

function normalizeCellValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function normalizeExtensionValue(value: string): string {
  return value.replace(/\.0+$/, '');
}

function normalizeExtensionSearch(value: string): string {
  const digitsOnly = value.replace(/[^\d]/g, '');
  return digitsOnly || value.toLowerCase();
}

function isNumericExtension(value: string): boolean {
  const cleaned = value.replace(/\s+/g, '').replace(/\./g, '');
  return cleaned.length > 0 && /^\d+$/.test(cleaned);
}

function normalizeApellido(nombre: string): string {
  if (!nombre) return '';
  const commaIndex = nombre.indexOf(',');
  const base = commaIndex >= 0 ? nombre.slice(0, commaIndex) : nombre.split(' ')[0];
  return cachedNormalizeText(base || nombre);
}

function computeSearchScore(person: Personnel, normalizedQuery: string, searchTerms: string[]): number {
  const apellido = normalizeApellido(person.name);
  if (apellido && normalizedQuery === apellido) return 3;

  const words = person.searchableName.split(' ').filter(Boolean);
  const startsWithAll = searchTerms.every(term =>
    words.some(word => word.startsWith(term) || word === term)
  );
  if (startsWithAll) return 2;

  const includesAll = searchTerms.every(term => person.searchableName.includes(term));
  if (includesAll) return 1;

  return 0;
}

function splitNames(value: string): string[] {
  return value
    .split(/\s*\/\s*|\s*;\s*|\s*\|\s*|\r?\n|\s+-\s+/g)
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

function matchesHeaderToken(normalized: string, tokens: readonly string[]): boolean {
  return tokens.some(token => normalized === token || normalized.includes(token));
}

function detectHeaderMapping(rawData: (string | number)[][]): { headerRowIndex: number; columnMap: ColumnMap } {
  const maxRows = Math.min(rawData.length, HEADER_SCAN_ROWS);

  for (let i = 0; i < maxRows; i++) {
    const row = rawData[i] || [];
    const map: ColumnMap = {
      extensionIndex: -1,
      departmentIndex: -1,
      titleIndex: -1,
      nameIndex: -1
    };
    let foundExtension = false;
    let foundDepartment = false;
    let foundTitle = false;
    let foundName = false;

    row.forEach((cell, idx) => {
      const normalized = cachedNormalizeText(normalizeCellValue(cell));
      if (!normalized) return;

      if (!foundExtension && matchesHeaderToken(normalized, HEADER_TOKENS.extension)) {
        map.extensionIndex = idx;
        foundExtension = true;
      }
      if (!foundDepartment && matchesHeaderToken(normalized, HEADER_TOKENS.department)) {
        map.departmentIndex = idx;
        foundDepartment = true;
      }
      if (!foundTitle && matchesHeaderToken(normalized, HEADER_TOKENS.title)) {
        map.titleIndex = idx;
        foundTitle = true;
      }
      if (!foundName && matchesHeaderToken(normalized, HEADER_TOKENS.name)) {
        map.nameIndex = idx;
        foundName = true;
      }
    });

    if (foundName && (foundExtension || foundDepartment)) {
      return { headerRowIndex: i, columnMap: map };
    }
  }

  return {
    headerRowIndex: -1,
    columnMap: {
      extensionIndex: DEFAULT_COLUMN_INDICES.extension,
      departmentIndex: DEFAULT_COLUMN_INDICES.department,
      titleIndex: DEFAULT_COLUMN_INDICES.title,
      nameIndex: DEFAULT_COLUMN_INDICES.name
    }
  };
}

function uniqueIndices(indices: number[]): number[] {
  const seen = new Set<number>();
  const result: number[] = [];

  indices.forEach(idx => {
    if (idx < 0 || Number.isNaN(idx)) return;
    if (seen.has(idx)) return;
    seen.add(idx);
    result.push(idx);
  });

  return result;
}

function pickCellText(row: (string | number)[], indices: number[]): string {
  for (const idx of indices) {
    if (idx < 0 || idx >= row.length) continue;
    const value = normalizeCellValue(row[idx]);
    if (value) return value;
  }
  return '';
}

/**
 * Transform technical errors into user-friendly messages
 * Maps different error types to appropriate Spanish messages
 * Returns object with message and retryable status
 */
function transformErrorMessage(error: Error | unknown): { message: string; isRetryable: boolean } {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // HTTP 404 - File not found (non-retryable)
    if (message.includes('http 404') || message.includes('not found')) {
      return { message: 'No se encontró el archivo del directorio interno', isRetryable: false };
    }

    // File not available (non-retryable)
    if (message.includes('no está disponible') || message.includes('archivo del directorio no está disponible')) {
      return { message: 'Error al cargar el directorio', isRetryable: false };
    }

    // Network errors (retryable)
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return { message: 'Error de conexión al cargar el directorio', isRetryable: true };
    }

    // File corruption/parsing errors (non-retryable)
    if (message.includes('xlsx') || message.includes('excel') || message.includes('parse') || message.includes('corrupt') ||
        message.includes('invalid html') || message.includes('<table>')) {
      return { message: 'Error al procesar el directorio', isRetryable: false };
    }

    // Empty file errors (non-retryable)
    if (message.includes('vacío') || message.includes('empty')) {
      return { message: 'El directorio está vacío', isRetryable: false };
    }

    // Generic Excel errors (non-retryable)
    if (message.includes('hoja') || message.includes('sheet')) {
      return { message: 'Error al procesar el directorio', isRetryable: false };
    }

    // Already user-friendly messages in Spanish
    if (/^[¿áéíóúñü\s\w.,:¡!()-]+$/.test(error.message)) {
      return { message: error.message, isRetryable: false };
    }
  }

  // Fallback for unknown errors (non-retryable to prevent loops)
  return { message: 'Error al cargar el directorio', isRetryable: false };
}

/**
 * Hook for managing internal directory data and search functionality
 * Loads and processes Excel data, provides search capabilities with department grouping
 */
export function useInternalDirectory(): SearchState & {
  search: (query: string) => void;
  clearSearch: () => void;
  allPersonnel: Personnel[];
  loadData: () => Promise<void>;
  isRetryableError: boolean;
} {
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [isRetryableError, setIsRetryableError] = useState<boolean>(true);

  // Load Excel data on demand (when first opened)
  const loadData = useCallback(async () => {
    // Allow retry even if data was previously marked as loaded (in case of file changes)
    // But skip if we're currently loading or the last load succeeded
    if (isLoading || (dataLoaded && !error) || (error && !isRetryableError)) {
      return; // Skip if already loading or have valid data
    }


    try {
      setIsLoading(true);
      setError(null);
      setIsRetryableError(true); // Reset retryable state for new attempts
      setDataLoaded(false); // Reset loaded state for fresh attempt

      // Fetch Excel file
      const response = await fetch('/internos.xlsx');

      // Check if response is successful
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: No se pudo cargar el directorio interno`);
      }

      // Check content type to ensure it's an Excel file, not HTML error page
      const contentType = response.headers.get('content-type');

      // More flexible content-type checking
      if (contentType && contentType.includes('text/html')) {
        // If it's HTML, it's likely an error page
        throw new Error('El archivo del directorio no está disponible');
      }

      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        throw new Error('El archivo Excel está vacío');
      }

      // Additional validation: Check if the file looks like HTML error page
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer.slice(0, 200));

      if (textContent.includes('<!DOCTYPE html>') ||
          textContent.includes('<html') ||
          textContent.includes('<HTML') ||
          textContent.includes('404') ||
          textContent.includes('Not Found') ||
          textContent.includes('Cannot GET') ||
          textContent.includes('<head>')) {
        throw new Error('El archivo del directorio no está disponible');
      }

      const XLSX = await getXlsxModule();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('El archivo Excel no tiene hojas de cálculo');
      }

      // Get first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      if (!worksheet) {
        throw new Error(`No se encontró la hoja "${worksheetName}"`);
      }

      // Convert to JSON with raw values - more efficient
      const worksheetRange = buildWorksheetRange(worksheet, XLSX);
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        range: worksheetRange
      }) as (string | number)[][];

      if (!rawData || rawData.length === 0) {
        throw new Error('No se encontraron datos en el archivo Excel');
      }

      // Process data into Personnel interface
      const processedData = processExcelData(rawData);

      setAllPersonnel(processedData);
      setDataLoaded(true);

    } catch (err) {
      // Transform to user-friendly message and determine retryability
      const { message: userFriendlyMessage, isRetryable } = transformErrorMessage(err);
      setError(userFriendlyMessage);
      setIsRetryableError(isRetryable);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, dataLoaded, error, isRetryableError]);

  
  /**
   * Process raw Excel data into Personnel records
   * Enhanced processing for better data extraction
   */
  const processExcelData = (rawData: (string | number)[][]): Personnel[] => {
    const personnel: Personnel[] = [];
    let id = 1;
    let stopProcessing = false;
    const { headerRowIndex, columnMap } = detectHeaderMapping(rawData);
    const dataStartIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;

    // Process rows after header (if detected)
    for (let i = dataStartIndex; i < rawData.length && !stopProcessing; i++) {
      const row = rawData[i];

      // Skip completely empty rows
      if (!row || row.every(cell => !cell || cell === '' || cell === 0)) continue;

      const rowValues = row.map(cell => normalizeCellValue(cell));

      // Skip header rows that repeat inside the data
      const normalizedRow = rowValues.map(value => cachedNormalizeText(value));
      const headerHasName = normalizedRow.some(value => matchesHeaderToken(value, HEADER_TOKENS.name));
      const headerHasExtension = normalizedRow.some(value => matchesHeaderToken(value, HEADER_TOKENS.extension));
      const headerHasDepartment = normalizedRow.some(value => matchesHeaderToken(value, HEADER_TOKENS.department));
      if (headerHasName && (headerHasExtension || headerHasDepartment)) continue;

      const extensionIndices = uniqueIndices([
        columnMap.extensionIndex,
        DEFAULT_COLUMN_INDICES.extension,
        0
      ]);
      const nameIndices = uniqueIndices([
        columnMap.nameIndex,
        DEFAULT_COLUMN_INDICES.name,
        DEFAULT_COLUMN_INDICES.title
      ]);
      const departmentIndices = uniqueIndices([
        columnMap.departmentIndex,
        DEFAULT_COLUMN_INDICES.department,
        DEFAULT_COLUMN_INDICES.title
      ]);

      const extensionRaw = pickCellText(row, extensionIndices);
      const nameRaw = pickCellText(row, nameIndices);
      const departmentRaw = pickCellText(row, departmentIndices);

      const extensionValue = extensionRaw ? normalizeExtensionValue(extensionRaw) : '';
      const hasName = nameRaw.length > 0;
      const hasExtension = extensionValue.length > 0;
      const hasNumericExtension = extensionRaw ? isNumericExtension(extensionRaw) : false;

      // Check for stop condition: TELÉFONOS INTERNOS RESERVA 6000 (solo encabezado)
      if (shouldStopProcessing(rowValues, hasName, hasNumericExtension)) {
        stopProcessing = true;
        break;
      }

      if (hasName || hasExtension) {
        let names: string[] = [];

        if (hasName) {
          names = splitNames(nameRaw);
        } else {
          names = ['Sin Nombre'];
        }

        const department = departmentRaw || 'Sector sin identificar';

        // Filter out unwanted content
        const filteredNames = names.filter(name =>
          name &&
          !name.toLowerCase().includes('acalandra@servicoop.com') &&
          !name.toLowerCase().includes('sector comunicaciones al interno') &&
          name.trim().length > 0
        );

        if (filteredNames.length === 0) continue;

        // Create personnel records for each name in the cell
        filteredNames.forEach(name => {
          const personnelRecord: Personnel = {
            id: String(id++),
            name: name,
            department: department,
            extension: extensionValue || 'N/A',
            searchableName: cachedNormalizeText(name),
            searchableExtension: normalizeExtensionSearch(extensionValue || '')
          };

          personnel.push(personnelRecord);
        });
      }
    }

        return personnel;
  };

  /**
   * Group search results by department for better organization
   */
  const groupResultsByDepartment = (results: Personnel[]): DepartmentGroup[] => {
    const grouped: { [key: string]: Personnel[] } = {};

    results.forEach(person => {
      if (!grouped[person.department]) {
        grouped[person.department] = [];
      }
      grouped[person.department].push(person);
    });

    return Object.entries(grouped)
      .map(([department, personnel]) => {
        const sortedPersonnel = [...personnel].sort((a, b) => {
          const scoreDiff = (b.searchScore || 0) - (a.searchScore || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return a.name.localeCompare(b.name);
        });
        const maxScore = sortedPersonnel[0]?.searchScore || 0;
        return { department, personnel: sortedPersonnel, maxScore };
      })
      .sort((a, b) => {
        const scoreDiff = b.maxScore - a.maxScore;
        if (scoreDiff !== 0) return scoreDiff;
        return a.department.localeCompare(b.department);
      })
      .map(({ department, personnel }) => ({ department, personnel }));
  };

  /**
   * Filter personnel based on search query
   * Supports start-of-word matching and accent-insensitive search
   */
  const filteredResults = useMemo(() => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const normalizedQuery = cachedNormalizeText(query.trim());
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    const numericQuery = normalizedQuery.replace(/\s+/g, '');
    const isNumericQuery = /^\d+$/.test(numericQuery);

    let matchingPersonnel: Personnel[] = [];

    if (isNumericQuery) {
      // Numeric search: find all people with matching extension
      matchingPersonnel = allPersonnel.filter(person =>
        person.searchableExtension.includes(numericQuery)
      );
    } else {
      const normalizedDepartmentQuery = normalizedQuery;
      const departmentMatches = allPersonnel.filter(person =>
        cachedNormalizeText(person.department).includes(normalizedDepartmentQuery)
      );

      const exactMatches = allPersonnel.filter(person => {
        return searchTerms.every(term => {
          const personWords = person.searchableName.split(' ');
          return personWords.some(word =>
            word.startsWith(term) ||
            word === term
          );
        });
      });

      const results: Personnel[] = [];
      const seen = new Set<string>();
      const addResults = (items: Personnel[]) => {
        items.forEach(item => {
          if (seen.has(item.id)) return;
          seen.add(item.id);
          results.push(item);
        });
      };

      if (exactMatches.length > 0) {
        const matchingExtensions = new Set(exactMatches.map(p => p.extension));
        addResults(allPersonnel.filter(person => matchingExtensions.has(person.extension)));
      } else {
        const fallbackMatches = allPersonnel.filter(person =>
          searchTerms.every(term => person.searchableName.includes(term))
        );
        addResults(fallbackMatches);
      }

      if (departmentMatches.length > 0 && searchTerms.length === 1) {
        addResults(departmentMatches);
      }

      matchingPersonnel = results;
    }

    // Store search terms for text highlighting
    return matchingPersonnel.map(person => ({
      ...person,
      searchTerms: searchTerms,
      searchScore: computeSearchScore(person, normalizedQuery, searchTerms)
    }));
  }, [query, allPersonnel]);

  const groupedResults = useMemo(() =>
    groupResultsByDepartment(filteredResults),
    [filteredResults]
  );

  /**
   * Search function with debouncing handled by consumer
   */
  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    results: filteredResults,
    groupedResults,
    isLoading,
    error,
    search,
    clearSearch,
    allPersonnel,
    loadData,
    isRetryableError
  };
}
