/// <reference lib="webworker" />

import readXlsxFile from 'read-excel-file/web-worker';
import { cachedNormalizeText } from '../lib/normalize';
import type { Personnel } from '../types/personnel';

type CellValue = string | number | boolean | Date | null | undefined;

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

type WorkerRequest = {
  requestId: number;
  blob: Blob;
};

type WorkerResponse =
  | { requestId: number; type: 'success'; personnel: Personnel[] }
  | { requestId: number; type: 'error'; message: string };

function clampRows(rows: CellValue[][]): CellValue[][] {
  return rows
    .slice(0, DIRECTORY_MAX_ROWS)
    .map(row => row.slice(0, DIRECTORY_MAX_COLUMNS));
}

function shouldStopProcessing(values: string[], hasName: boolean, hasNumericExtension: boolean): boolean {
  if (hasName || hasNumericExtension) return false;
  return values.some(value => {
    if (!value) return false;
    const normalized = cachedNormalizeText(value);
    return normalized.length > 0 && STOP_TOKEN_NORMALIZED.some(token => normalized.includes(token));
  });
}

function normalizeCellValue(value: CellValue): string {
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

function splitNames(value: string): string[] {
  return value
    .split(/\s*\/\s*|\s*;\s*|\s*\|\s*|\r?\n|\s+-\s+/g)
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

function matchesHeaderToken(normalized: string, tokens: readonly string[]): boolean {
  return tokens.some(token => normalized === token || normalized.includes(token));
}

function detectHeaderMapping(rawData: CellValue[][]): { headerRowIndex: number; columnMap: ColumnMap } {
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

function pickCellText(row: CellValue[], indices: number[]): string {
  for (const idx of indices) {
    if (idx < 0 || idx >= row.length) continue;
    const value = normalizeCellValue(row[idx]);
    if (value) return value;
  }
  return '';
}

function processExcelData(rawData: CellValue[][]): Personnel[] {
  const personnel: Personnel[] = [];
  let id = 1;
  let stopProcessing = false;
  const { headerRowIndex, columnMap } = detectHeaderMapping(rawData);
  const dataStartIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;

  for (let i = dataStartIndex; i < rawData.length && !stopProcessing; i++) {
    const row = rawData[i];

    if (!row || row.every(cell => !cell || cell === '' || cell === 0)) continue;

    const rowValues = row.map(cell => normalizeCellValue(cell));

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

      const filteredNames = names.filter(name =>
        name &&
        !name.toLowerCase().includes('acalandra@servicoop.com') &&
        !name.toLowerCase().includes('sector comunicaciones al interno') &&
        name.trim().length > 0
      );

      if (filteredNames.length === 0) continue;

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
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { requestId, blob } = event.data || {};
  if (!blob || typeof requestId !== 'number') return;

  try {
    const rawRows = await readXlsxFile(blob);
    const rawData = clampRows(rawRows as CellValue[][]);

    if (!rawData || rawData.length === 0) {
      throw new Error('No se encontraron datos en el archivo Excel');
    }

    const processedData = processExcelData(rawData);

    const response: WorkerResponse = {
      requestId,
      type: 'success',
      personnel: processedData
    };
    self.postMessage(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar el directorio';
    const response: WorkerResponse = {
      requestId,
      type: 'error',
      message
    };
    self.postMessage(response);
  }
};
