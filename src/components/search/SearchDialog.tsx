import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    textMuted?: string;
    bgCard?: string;
    bgHover?: string;
    badge?: string;
    resultBg?: string;
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
  }, [isOpen, loadData]);

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

  const resultCount = useMemo(
    () => countWordAppearances(searchQuery, groupedResults),
    [searchQuery, groupedResults, countWordAppearances]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-4xl h-[85vh] w-[95vw] sm:w-full p-0 ${themeClasses.bg} ${themeClasses.text} border-2 ${themeClasses.border} flex flex-col`}
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

      {/* Header Section - Fixed */}
      <div className="flex-shrink-0">
        {/* Corporate Header */}
        <div className="p-4 sm:p-6 pb-2 sm:pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${themeClasses.bg} rounded-md`}>
              <Search className={`h-5 w-5 ${themeClasses.textMuted}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${themeClasses.text} directorio-titulo directorio-texto-principal`}>
                Directorio Interno
              </h2>
              <p className={`text-sm ${themeClasses.textMuted} directorio-descripcion directorio-texto-secundario`}>
                Busque personal por nombre, departamento o extensión
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* Search Input Section */}
        <div className="px-4 sm:px-6 pb-1 sm:pb-1.5 space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className={`h-4 w-4 ${themeClasses.textMuted}`} />
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
                ${themeClasses.bg}
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
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${themeClasses.bgHover} ${themeClasses.textMuted}`}
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Summary */}
          {!isLoading && !error && searchQuery.length >= 2 && groupedResults.length > 0 && (
            <div className={`flex items-center justify-between text-sm ${themeClasses.textMuted} pb-2`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{resultCount} resultado{resultCount === 1 ? '' : 's'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{groupedResults.length} departamento{groupedResults.length === 1 ? '' : 's'}</span>
                </div>
              </div>
              {resultCount > 10 && (
                <span className="text-xs opacity-75">
                  ↓ Desplácese para ver más resultados
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error Retry Button - Show with error message */}
        {error && isRetryableError && (
          <div className="flex justify-end px-4 sm:px-6 pb-2 sm:pb-4">
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${themeClasses.border} ${themeClasses.text} ${themeClasses.bgHover}`}
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        )}

        {/* Search Results Section - Scrollable */}
        <div className={`flex-1 min-h-0 pr-2 mb-4 ${themeClasses.text} overflow-y-auto search-scrollbar`}>
          <SearchResults
            groupedResults={groupedResults}
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            isSearching={isSearching}
            themeClasses={themeClasses}
            onRetry={isRetryableError ? handleRetry : undefined}
          />
        </div>

      </DialogContent>
    </Dialog>
  );
}