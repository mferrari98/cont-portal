/**
 * Internal personnel data structure
 */
export interface Personnel {
  id: string;
  name: string;           // "APELLIDO, Nombre" format
  department: string;     // Sector/Department name
  extension: string;      // Internal phone extension
  searchableName: string; // Normalized name for search (lowercase)
  searchableExtension: string; // Normalized extension for search (lowercase)
  searchTerms?: string[]; // Terms to highlight in the display
}

/**
 * Grouped personnel by department for search results display
 */
export interface DepartmentGroup {
  department: string;
  personnel: Personnel[];
}

/**
 * Search state management interface
 */
export interface SearchState {
  query: string;
  results: Personnel[];
  groupedResults: DepartmentGroup[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Raw Excel row data structure
 */
export interface ExcelRow {
  [key: string]: string | number | undefined;
}