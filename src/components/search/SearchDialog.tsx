import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, RefreshCw, X, Building } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { useInternalDirectory } from '@/hooks/useInternalDirectory';
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

  // Debounced search with 300ms delay
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      search('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      search(searchQuery);
      // Give a small delay for results to be processed, then stop searching
      setTimeout(() => {
        setIsSearching(false);
      }, 100);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery]);

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

  // Copy of normalizeText function from useInternalDirectory for consistent counting
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/[,\s-]+/g, ' ')
      .replace(/[^\w\s]/g, '') // Remove special characters except accents (which were already removed)
      .trim();
  };

  // Count word appearances using same normalization as search algorithm
  const countWordAppearances = (query: string, groupedResults: DepartmentGroup[]): number => {
    if (!query || query.length < 2) return 0;
    const normalizedQuery = normalizeText(query.trim());

    return groupedResults.reduce((total, dept) => {
      return total + dept.personnel.reduce((deptTotal: number, person: { name: string }) => {
        // Count occurrences in the normalized searchable name
        const searchableName = normalizeText(person.name);
        const regex = new RegExp(normalizedQuery, 'gi');
        const matches = searchableName.match(regex);
        return deptTotal + (matches ? matches.length : 0);
      }, 0);
    }, 0);
  };

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

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 text-xl mb-2">
            <div className={`p-2 rounded-lg ${themeClasses.bg.includes('dark') ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-semibold">Búsqueda de Directorio Interno</span>
          </div>
          <p className={`text-sm ${themeClasses.text} opacity-70`}>
            Busca contactos por nombre, departamento o número de extensión
          </p>
        </div>

        {/* Search Input Section */}
        <div className="px-6 pb-6 space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nombre, departamento o extensión..."
              value={searchQuery}
              onChange={handleInputChange}
              className={`pl-10 pr-12 text-base h-11 ${themeClasses.border} ${themeClasses.text} ${themeClasses.bg}`}
              aria-label="Buscar contacto por nombre o número interno"
              autoComplete="off"
              spellCheck={false}
              role="searchbox"
              aria-expanded={searchQuery.length >= 2}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Quick Stats - Shows word appearances and sectors */}
          {!isLoading && !error && searchQuery.length >= 2 && groupedResults.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{countWordAppearances(searchQuery, groupedResults)} aparicion{countWordAppearances(searchQuery, groupedResults) === 1 ? '' : 'es'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{groupedResults.length} sector{groupedResults.length === 1 ? '' : 'es'}</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          <ScrollArea className={`h-64 sm:h-80 pr-4 ${themeClasses.text}`}>
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

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t ${themeClasses.border}">
            <p className={`text-xs ${themeClasses.text} opacity-60`}>
              Presiona <kbd className="px-2 py-1 text-xs rounded bg-muted">Esc</kbd> para cerrar
            </p>
            {error && isRetryableError && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
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