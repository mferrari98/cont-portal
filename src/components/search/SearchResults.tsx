import { Loader2, Users, AlertCircle, RefreshCw, SearchIcon, Phone, Building } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
    textSubtle?: string;
    bgCard?: string;
    bgHover?: string;
    badge?: string;
    resultBg?: string;
  };
  onRetry?: () => void; // Optional retry function
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
  themeClasses,
  onRetry
}: SearchResultsProps) {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${themeClasses.border} rounded-lg p-4`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Searching state
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className={`h-6 w-6 animate-spin mb-3 ${themeClasses.textSubtle || themeClasses.textMuted}`} />
        <p className={`text-sm ${themeClasses.textMuted}`}>Buscando...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center" role="alert" aria-live="polite" aria-atomic="true">
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 ${themeClasses.bg} rounded-full border ${themeClasses.border}`}>
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text} mb-1`}>{error}</p>
            <p className={`text-sm ${themeClasses.textMuted}`}>
              No se pudo cargar el directorio interno
            </p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${themeClasses.border} ${themeClasses.text} ${themeClasses.bgHover}`}
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Empty search state
  if (searchQuery.trim().length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 ${themeClasses.bg} rounded-full border ${themeClasses.border}`}>
            <SearchIcon className={`h-6 w-6 ${themeClasses.textMuted}`} />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text} mb-1`}>
              Directorio Interno
            </p>
            <p className={`text-sm ${themeClasses.textMuted} max-w-xs mx-auto`}>
              Ingrese un nombre, departamento o extensión para buscar
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No results state
  if (groupedResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 ${themeClasses.bg} rounded-full border ${themeClasses.border}`}>
            <Users className={`h-6 w-6 ${themeClasses.textMuted}`} />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text} mb-1`}>Sin Resultados</p>
            <p className={`text-sm ${themeClasses.textMuted} max-w-xs mx-auto`}>
              No se encontraron personal para "<span className={`font-mono ${themeClasses.bg}/80 px-1 py-0.5 rounded text-xs ${themeClasses.text}`}>{searchQuery}</span>"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 mx-4 sm:mx-6 my-2" role="region" aria-live="polite" aria-label="Resultados de búsqueda">
      {Object.entries(resultsByExtension).map(([extension, people]) => {
        const typedPeople = people as typeof groupedResults[0]['personnel'];
        const department = typedPeople[0]?.department || 'Sector desconocido';
        const searchTerms = typedPeople[0]?.searchTerms || [];

        // Skip problematic entries
        if (department === 'Sector sin identificar' || !department || department.trim() === '') {
          return null;
        }

        return (
          <div key={extension}>
            <ExtensionCard
              extension={extension}
              department={department}
              people={typedPeople}
              searchTerms={searchTerms}
              themeClasses={themeClasses}
            />
            </div>
        );
      }).filter(Boolean)}
    </div>
  );
}

/**
 * Corporate Extension Card with professional business styling
 */
function ExtensionCard({
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
    resultBg?: string;
  };
}) {
  const isSinglePerson = people.length === 1;

  return (
    <div className={`rounded-lg p-4 mb-3 ${themeClasses.resultBg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 ${themeClasses.bg}/80 rounded-md`}>
            <Building className={`h-4 w-4 ${themeClasses.textMuted}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${themeClasses.text} truncate`}>
              {department}
            </h3>
            <p className={`text-xs ${themeClasses.textMuted} mt-0.5`}>
              {people.length} {people.length === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 font-mono px-2.5 py-1.5 ${themeClasses.bg}/80 ${themeClasses.text} font-medium rounded-md`}>
          <Phone className="h-3 w-3" />
          <span>int.</span> {extension}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`p-1.5 ${themeClasses.bg}/80 rounded-md`}>
          <Users className={`h-3.5 w-3.5 ${themeClasses.textMuted}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm break-words">
            {isSinglePerson ? (
              <span className={`persona-badge inline-block px-2 py-0.5 text-sm rounded`}>
                {highlightText(normalizeName(people[0].name), searchTerms)}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {people.map((person) => (
                  <span
                    key={person.id}
                    className={`persona-badge inline-block px-2 py-0.5 text-sm rounded`}
                  >
                    {highlightText(normalizeName(person.name), searchTerms)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Function to highlight search terms with corporate styling
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
          <mark
            key={index}
            className="
              inline-block px-1 py-0.5 -m-0.5
              bg-blue-100 dark:bg-blue-900/30
              text-[#141413] dark:text-blue-200
              font-medium rounded
            "
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}
