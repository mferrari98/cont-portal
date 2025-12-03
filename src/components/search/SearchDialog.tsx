import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, RefreshCw, X, Building } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { useInternalDirectory } from '@/hooks/useInternalDirectory';
import { cachedNormalizeText } from '@/lib/normalize';
import type { DepartmentGroup } from '@/types/personnel';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  themeClasses: {
    border: string;
    text: string;
    bg: string;
  };
}

/**
 * Search dialog component for internal directory search
 * Provides search interface with real-time filtering and results display
 */
export function SearchDialog({ isOpen, onClose, themeClasses }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    search,
    groupedResults,
    isLoading,
    error,
    loadData,
    isRetryableError
  } = useInternalDirectory();

  // Optimized debounced search with 300ms delay
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      search('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      search(searchQuery);
      // Minimal delay for UI feedback
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery, search]); // Include search function dependency

  // Load data and focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Load data when dialog opens (lazy loading) - only if not already loaded
      loadData();

      // Focus input after a small delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]); // Remove loadData from dependencies to prevent infinite loops

  // Handle retry functionality
  const handleRetry = () => {
    loadData();
  };

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      search('');
    }
  }, [isOpen, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    search('');
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Count word appearances using cached normalization for performance
  const countWordAppearances = useCallback((query: string, groupedResults: DepartmentGroup[]): number => {
    if (!query || query.length < 2) return 0;
    const normalizedQuery = cachedNormalizeText(query.trim());

    return groupedResults.reduce((total, dept) => {
      return total + dept.personnel.reduce((deptTotal: number, person: { name: string }) => {
        // Count occurrences in the normalized searchable name
        const searchableName = cachedNormalizeText(person.name);
        const regex = new RegExp(normalizedQuery, 'gi');
        const matches = searchableName.match(regex);
        return deptTotal + (matches ? matches.length : 0);
      }, 0);
    }, 0);
  }, []); // Memoized function with no dependencies

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-4xl max-h-[85vh] w-[95vw] sm:w-full p-0 ${themeClasses.bg} ${themeClasses.text} border-2 ${themeClasses.border}`}
        onKeyDown={handleKeyDown}
      >
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}>
          Búsqueda Teléfonos Internos - Diálogo de búsqueda de directorio interno
        </DialogTitle>

        {/* Hidden DialogDescription for accessibility */}
        <DialogDescription style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}>
          Diálogo para buscar contactos del directorio interno por nombre o número interno
        </DialogDescription>

        {/* Corporate Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Directorio Interno
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Busque personal por nombre, departamento o extensión
              </p>
            </div>
          </div>
        </div>

        {/* Search Input Section */}
        <div className="px-6 pb-6 space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nombre, departamento o extensión..."
              value={searchQuery}
              onChange={handleInputChange}
              className={`
                pl-10 pr-10 h-10
                border ${themeClasses.border}
                ${themeClasses.bgCard}
                ${themeClasses.text}
                placeholder:text-muted-foreground
                focus:ring-2 focus:ring-ring focus:border-ring
                hover:border-muted-foreground
              `}
              aria-label="Buscar personal por nombre o número interno"
              autoComplete="off"
              spellCheck={false}
              role="searchbox"
              aria-expanded={searchQuery.length >= 2}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Summary */}
          {!isLoading && !error && searchQuery.length >= 2 && groupedResults.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{countWordAppearances(searchQuery, groupedResults)} resultado{countWordAppearances(searchQuery, groupedResults) === 1 ? '' : 's'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{groupedResults.length} departamento{groupedResults.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          )}

          {/* Search Results Container */}
          <ScrollArea className={`h-64 sm:h-80 pr-2 ${themeClasses.text}`}>
            <SearchResults
              groupedResults={groupedResults}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              isSearching={isSearching}
              themeClasses={themeClasses}
              onRetry={isRetryableError ? handleRetry : undefined}
            />
          </ScrollArea>

          {/* Corporate Footer */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono">Esc</kbd>
              <span>para cerrar</span>
            </p>
            {error && isRetryableError && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}