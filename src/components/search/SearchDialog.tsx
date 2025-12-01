import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SearchResults } from './SearchResults';
import { useInternalDirectory } from '@/hooks/useInternalDirectory';

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
    loadData
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
      // Load data when dialog opens (lazy loading)
      loadData();

      // Focus input after a small delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, loadData]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-5xl max-h-[90vh] w-[95vw] sm:w-full ${themeClasses.bg} ${themeClasses.text} border-2 ${themeClasses.border}`}
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

        {/* Visible title for UI */}
        <div className="text-lg sm:text-xl mb-4">
          <span className="truncate">Búsqueda Teléfonos Internos</span>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nombre o número interno..."
              value={searchQuery}
              onChange={handleInputChange}
              className={`text-base sm:text-lg py-2 sm:py-3 ${themeClasses.border} ${themeClasses.text} ${themeClasses.bg}`}
              aria-label="Buscar contacto por nombre o número interno"
              autoComplete="off"
              spellCheck={false}
              role="searchbox"
              aria-expanded={searchQuery.length >= 2}
            />
          </div>

          {/* Search Results */}
          <div
            className={`max-h-48 sm:max-h-80 overflow-y-auto custom-scrollbar ${themeClasses.border.includes('#1F1E1D') || themeClasses.border.includes('dark:border-gray-700') ? 'dark-scrollbar' : 'light-scrollbar'}`}
          >
            <SearchResults
              groupedResults={groupedResults}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              isSearching={isSearching}
              themeClasses={themeClasses}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}