import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchButtonProps {
  onClick: () => void;
  themeClasses: {
    border: string;
    text: string;
  };
  className?: string;
}

/**
 * Search button component for the portal header
 * Matches existing button aesthetics with theme support
 */
export function SearchButton({ onClick, themeClasses, className = '' }: SearchButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8 ${className}`}
      aria-label="Buscar directorio interno"
      title="Buscar directorio interno"
    >
      <Search className="w-4 h-4" />
    </Button>
  );
}