import { Loader2, Users, AlertCircle, RefreshCw, SearchIcon, Phone, Building } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  // Loading state (only show during initial data loading)
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Searching state (show spinner during search)
  if (isSearching) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
        <p className={`text-sm ${themeClasses.text} opacity-70`}>Buscando...</p>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`p-6 text-center ${themeClasses.bg} ${themeClasses.text} ${themeClasses.border}`} role="alert" aria-live="polite" aria-atomic="true">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text} mb-1`}>{error}</p>
            <p className={`text-sm ${themeClasses.text} opacity-60`}>
              No se pudo cargar el directorio de internos
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Empty search state
  if (searchQuery.trim().length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <SearchIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text} mb-1`}>Buscar en el Directorio</p>
            <p className={`text-sm ${themeClasses.text} opacity-60`}>
              Escriba un nombre, departamento o extensión para comenzar
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // No results state (only show when not searching)
  if (groupedResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
            <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text} mb-1`}>Sin Resultados</p>
            <p className={`text-sm ${themeClasses.text} opacity-60`}>
              No se encontraron contactos para "{searchQuery}"
            </p>
          </div>
        </div>
      </Card>
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
    <div className="space-y-3" role="region" aria-live="polite" aria-label="Resultados de búsqueda">
      {Object.entries(resultsByExtension).map(([extension, people], index) => {
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
            {/* Separator line between sectors - only add if not last item */}
            {index < Object.keys(resultsByExtension).length - 1 && (
              <div className="h-px bg-gray-300 dark:bg-gray-600 my-6 opacity-100"></div>
            )}
          </div>
        );
      }).filter(Boolean)}
    </div>
  );
}

/**
 * Extension Card - modern card showing extension details with shadcn components
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
  };
}) {
  const isSinglePerson = people.length === 1;

  return (
    <Card className={`${themeClasses.border} ${themeClasses.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-base font-semibold ${themeClasses.text} truncate leading-tight`}>
                {department}
              </CardTitle>
              <p className={`text-xs ${themeClasses.text} opacity-60 mt-1`}>
                {people.length} contacto{people.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className={`font-mono text-base px-3 py-1.5 bg-yellow-100 dark:bg-yellow-500 text-yellow-700 dark:text-black font-semibold rounded-md`}>
            <span className="opacity-70">int.</span> {extension}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-muted/50">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-base font-medium ${themeClasses.text} break-words leading-relaxed`}>
              {isSinglePerson ? (
                highlightText(normalizeName(people[0].name), searchTerms)
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {people.map((person) => (
                    <Badge
                      key={person.id}
                      variant="secondary"
                      className="text-sm px-2.5 py-1 font-medium"
                    >
                      {highlightText(normalizeName(person.name), searchTerms)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
