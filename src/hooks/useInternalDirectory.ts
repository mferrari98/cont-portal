import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { Personnel, DepartmentGroup, SearchState } from '@/types/personnel';

/**
 * Hook for managing internal directory data and search functionality
 * Loads and processes Excel data, provides search capabilities with department grouping
 */
export function useInternalDirectory(): SearchState & {
  search: (query: string) => void;
  clearSearch: () => void;
  allPersonnel: Personnel[];
  loadData: () => Promise<void>;
} {
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Load Excel data on demand (when first opened)
  const loadData = async () => {
    if (dataLoaded && allPersonnel.length > 0) {
      return; // Data already loaded
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch Excel file
      const response = await fetch('/internos.xlsx');
      if (!response.ok) {
        throw new Error('No se pudo cargar el directorio interno');
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });

      // Get first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      // Convert to JSON with raw values - more efficient
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        range: 'A1:E200' // Limit range for performance
      }) as (string | number)[][];

      // Process data into Personnel interface
      const processedData = processExcelData(rawData);
      setAllPersonnel(processedData);
      setDataLoaded(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading internal directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Normalize text by removing accents and converting to lowercase
   * This allows searching without tildes: 'á' becomes 'a', 'é' becomes 'e', etc.
   */
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/[,\s-]+/g, ' ')
      .replace(/[^\w\s]/g, '') // Remove special characters except accents (which were already removed)
      .trim();
  };

  /**
   * Process raw Excel data into Personnel records
   * Enhanced processing for better data extraction
   */
  const processExcelData = (rawData: (string | number)[][]): Personnel[] => {
    const personnel: Personnel[] = [];
    let id = 1;
    let stopProcessing = false;

    // Process all rows starting from index 0 (including headers)
    for (let i = 0; i < rawData.length && !stopProcessing; i++) {
      const row = rawData[i];

      // Skip completely empty rows
      if (!row || row.every(cell => !cell || cell === '' || cell === 0)) continue;

      // Get data from columns (B=Extension, C=Department, D=Position/Title, E=Name)
      const colA = String(row[0] || '').trim(); // Column A
      const colB = String(row[1] || '').trim(); // Extension (real data in column B)
      const colC = String(row[2] || '').trim(); // Department/Sector
      const colD = String(row[3] || '').trim(); // Position/Title
      const colE = String(row[4] || '').trim(); // Name (real data in column E)

      // Check for stop condition: TELÉFONOS INTERNOS RESERVA 6000
      if (colA.includes('TELÉFONOS INTERNOS RESERVA') ||
          colA.includes('RESERVA 6000') ||
          colD.includes('TELÉFONOS INTERNOS RESERVA')) {
        console.log(`STOP: Found reservation section at row ${i}, stopping processing`);
        stopProcessing = true;
        break;
      }

      // Debug all non-empty rows for first 50 and any "Redes"
      if (i < 50 || colC.toLowerCase().includes('redes') || colD.toLowerCase().includes('redes')) {
        console.log(`ROW ${i}: [A:${colA}|B:${colB}|C:${colC}|D:${colD}|E:${colE}]`);
      }

      // Skip if this is an empty row or header row
      if (!colA && !colB && !colC && !colD && !colE) continue;

      // Skip header rows
      if (colD === 'Título' || colD === 'Sector' || colE === 'Apellido y Nombre') continue;

      // Personnel record - we need either a name or an extension
      const hasName = colE && colE.trim() !== '';
      const hasExtension = colB && colB.trim() !== '';

      if (hasName || hasExtension) {
        // Handle multiple names in the same cell separated by " - "
        const extension = hasExtension ? colB.trim() : 'N/A';
        let names: string[] = [];

        if (hasName) {
          names = colE.split(' - ').map(n => n.trim()).filter(n => n.length > 0);
        } else {
          names = [colD || 'Sin Nombre'];
        }

        // Use Sector (Column D) as the department name
        const department = colD || 'Sector sin identificar';

        // Debug log for any "Redes" related data
        if (department.toLowerCase().includes('redes') ||
            names.some(name => name.toLowerCase().includes('redes'))) {
          console.log('REDES DEBUG - Found:', {
            row: i,
            department,
            names,
            extension,
            colA, colB, colC, colD, colE
          });
        }

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
            extension: extension,
            searchableName: normalizeText(name),
            searchableExtension: extension.toLowerCase()
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
      .map(([department, personnel]) => ({ department, personnel }))
      .sort((a, b) => a.department.localeCompare(b.department));
  };

  /**
   * Filter personnel based on search query
   * Supports start-of-word matching and accent-insensitive search
   */
  const filteredResults = useMemo(() => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const normalizedQuery = normalizeText(query.trim());
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    const isNumericQuery = /^\d+$/.test(normalizedQuery);

    let matchingPersonnel: Personnel[] = [];

    if (isNumericQuery) {
      // Numeric search: find all people with matching extension
      matchingPersonnel = allPersonnel.filter(person =>
        person.searchableExtension.includes(normalizedQuery)
      );
    } else {
      // Check if this is a sector search (query matches a department name)
      const normalizedDepartmentQuery = normalizeText(query.trim());
      const sectorMatches = allPersonnel.filter(person =>
        normalizeText(person.department).includes(normalizedDepartmentQuery)
      );

      if (sectorMatches.length > 0 && searchTerms.length === 1) {
        // Sector search: show all people from this sector
        const sectorName = sectorMatches[0].department;
        matchingPersonnel = allPersonnel.filter(person =>
          person.department === sectorName
        );
      } else {
        // Person name search: find names that start with the search terms
        const exactMatches = allPersonnel.filter(person => {
          // Check if all search terms match the beginning of words in the name
          return searchTerms.every(term => {
            const personWords = person.searchableName.split(' ');

            // Check if the term matches the start of any word in the person's name
            return personWords.some(word =>
              word.startsWith(term) || // Starts with the term
              word === term // Exact match
            );
          });
        });

        if (exactMatches.length > 0) {
          // Get all extensions of exact matches
          const matchingExtensions = new Set(exactMatches.map(p => p.extension));

          // Return all people who share these extensions
          matchingPersonnel = allPersonnel.filter(person =>
            matchingExtensions.has(person.extension)
          );
        }
      }
    }

    // Store search terms for text highlighting
    return matchingPersonnel.map(person => ({
      ...person,
      searchTerms: searchTerms
    }));
  }, [query, allPersonnel]);

  const groupedResults = useMemo(() =>
    groupResultsByDepartment(filteredResults),
    [filteredResults]
  );

  /**
   * Search function with debouncing handled by consumer
   */
  const search = (newQuery: string) => {
    setQuery(newQuery);
  };

  /**
   * Clear search results
   */
  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    results: filteredResults,
    groupedResults,
    isLoading,
    error,
    search,
    clearSearch,
    allPersonnel,
    loadData
  };
}