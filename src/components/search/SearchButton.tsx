import { BookOpen } from 'lucide-react';
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
      className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 px-3 gap-2 font-semibold hover:cursor-pointer ${className}`}
      aria-label="Busqueda internos"
      title="Busqueda internos"
    >
      <BookOpen className="w-4 h-4" />
      <span>Busqueda internos</span>
    </Button>
  );
}
