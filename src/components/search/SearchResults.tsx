import { Loader2, Users, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import type { DepartmentGroup } from '@/types/personnel';

/**
 * Normalize name format: first letter of last name and first name in uppercase
 * Example: "perez juan" -> "Perez Juan"
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface SearchResultsProps {
  groupedResults: DepartmentGroup[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  isSearching: boolean;
  themeClasses: {
    border: string;
    text: string;
    bg: string;
    textMuted?: string;
  };
}

/**
 * Search results component displaying grouped personnel by department
 * Shows loading states, empty states, and error handling
 */
export function SearchResults({
  groupedResults,
  isLoading,
  error,
  searchQuery,
  isSearching,
  themeClasses
}: SearchResultsProps) {
  // Loading state (only show during initial data loading)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mb-2 sm:mb-3" />
        <p className={`text-sm sm:text-base ${themeClasses.text} opacity-70 text-center`}>
          Cargando directorio interno...
        </p>
      </div>
    );
  }

  // Searching state (show spinner during search)
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin opacity-70 mb-2" />
        <p className={`text-sm sm:text-base ${themeClasses.text} opacity-50 text-center`}>
          Buscando...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4">
        <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 mb-2 sm:mb-3" />
        <p className={`text-sm sm:text-base ${themeClasses.text} opacity-70 text-center`}>
          Error al cargar el directorio: {error}
        </p>
      </div>
    );
  }

  // Empty search state
  if (searchQuery.trim().length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4">
        <Search className="h-10 w-10 sm:h-12 sm:w-12 opacity-30 mb-3" />
        <p className={`text-sm sm:text-base ${themeClasses.text} opacity-70 text-center`}>
          Escriba un nombre para buscar en el directorio
        </p>
      </div>
    );
  }

  // No results state (only show when not searching)
  if (groupedResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4">
        <Users className="h-10 w-10 sm:h-12 sm:w-12 opacity-30 mb-3" />
        <p className={`text-sm sm:text-base ${themeClasses.text} opacity-70 text-center`}>
          No se encontraron resultados para "{searchQuery}"
        </p>
        <p className={`text-xs sm:text-sm ${themeClasses.text} opacity-50 mt-1 text-center`}>
          Intente con otro nombre o número interno
        </p>
      </div>
    );
  }

  // Group results by extension to decide display format
  const resultsByExtension = useMemo(() => {
    const extensionGroups: { [key: string]: typeof groupedResults[0]['personnel'] } = {};

    groupedResults.forEach(dept => {
      dept.personnel.forEach(person => {
        if (!extensionGroups[person.extension]) {
          extensionGroups[person.extension] = [];
        }
        extensionGroups[person.extension].push(person);
      });
    });

    return extensionGroups;
  }, [groupedResults]);

  return (
    <div
      className={`space-y-2 custom-scrollbar ${themeClasses.border.includes('#1F1E1D') ? 'dark-scrollbar' : 'light-scrollbar'}`}
      role="region"
      aria-live="polite"
      aria-label="Resultados de búsqueda"
    >
      {Object.entries(resultsByExtension).map(([extension, people]) => {
        const typedPeople = people as typeof groupedResults[0]['personnel'];
        const department = typedPeople[0]?.department || 'Sector desconocido';
        const searchTerms = typedPeople[0]?.searchTerms || [];

        // Debug log for problematic data
        if (department.includes('externo') || extension.includes('externo')) {
          console.log('DEBUG - Externo found:', { extension, department, people: typedPeople });
        }

        // Skip problematic entries
        if (department === 'Sector sin identificar' || !department || department.trim() === '') {
          console.log('DEBUG - Skipping invalid department:', { extension, department });
          return null;
        }

        return (
          <ExtensionBlock
            key={extension}
            extension={extension}
            department={department}
            people={typedPeople}
            searchTerms={searchTerms}
            themeClasses={themeClasses}
          />
        );
      }).filter(Boolean)}

      {/* Results summary */}
      {Object.keys(resultsByExtension).length > 0 && (
        <div className={`text-xs sm:text-sm ${themeClasses.text} opacity-50 pt-2 border-t ${themeClasses.border} px-2`}
             role="status" aria-atomic="true">
          {Object.keys(resultsByExtension).length} interno{Object.keys(resultsByExtension).length === 1 ? '' : 's'} encontrado{Object.keys(resultsByExtension).length === 1 ? '' : 's'}
        </div>
      )}
    </div>
  );
}

/**
 * Extension block - shows single person or group based on context
 */
function ExtensionBlock({
  extension,
  department,
  people,
  searchTerms,
  themeClasses
}: {
  extension: string;
  department: string;
  people: {
    id: string;
    name: string;
    department: string;
    extension: string;
    searchTerms?: string[];
  }[];
  searchTerms: string[];
  themeClasses: {
    border: string;
    text: string;
    bg: string;
    textMuted?: string;
  };
}) {
  const isSinglePerson = people.length === 1;

  // Determine background color based on theme (lighter than current)
  const getLighterBg = () => {
    if (themeClasses.bg.includes('bg-white')) return 'bg-gray-50';
    if (themeClasses.bg.includes('dark:bg-gray-900')) return 'dark:bg-gray-800';
    if (themeClasses.bg.includes('bg-')) {
      return themeClasses.bg.replace('bg-', 'bg-opacity-20 bg-');
    }
    return 'bg-opacity-20 bg-gray-200 dark:bg-opacity-20 dark:bg-gray-700';
  };

  return (
    <section
      className={`border rounded-lg p-3 sm:p-4 ${themeClasses.border} ${getLighterBg()}`}
      aria-labelledby={`extension-${extension}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b ${themeClasses.border}">
        <h3 id={`extension-${extension}`} className={`text-sm sm:text-base font-semibold ${themeClasses.text} truncate`}>
          {department}
        </h3>
        <span className={`text-base sm:text-lg font-bold font-mono px-3 py-1 rounded-md bg-yellow-400 text-gray-900 dark:bg-yellow-500 dark:text-gray-900 shadow-md`}>
          {extension}
        </span>
      </div>

      {/* Content */}
      <div className={`flex items-center justify-between p-3 rounded-md transition-colors ${getLighterBg()} hover:bg-opacity-30`}>
        <div className="flex-1 min-w-0">
          <p className={`text-sm sm:text-base ${themeClasses.text} break-words leading-snug`}>
            {isSinglePerson ? (
              highlightText(normalizeName(people[0].name), searchTerms)
            ) : (
              people.map((person, index) => (
                <span key={person.id}>
                  {index > 0 && <span className={`${themeClasses.textMuted} mx-1`}>,</span>}
                  {highlightText(normalizeName(person.name), searchTerms)}
                </span>
              ))
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Function to highlight search terms in text
 */
function highlightText(text: string, searchTerms: string[] = []) {
  if (!searchTerms || searchTerms.length === 0) {
    return <span>{text}</span>;
  }

  // Create regex pattern for all search terms (case insensitive)
  const pattern = new RegExp(`(${searchTerms.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = searchTerms.some(term =>
          part.toLowerCase() === term.toLowerCase()
        );
        return isMatch ? (
          <mark key={index} className="bg-[#6ccff6] text-gray-900 px-0.5 rounded font-semibold">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}


// Import Search icon for the empty state
import { Search } from 'lucide-react';