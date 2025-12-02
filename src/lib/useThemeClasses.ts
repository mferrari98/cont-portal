import { useMemo } from 'react';

export interface ThemeClasses {
  bg: string;
  bgCard: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textFaded: string;
  border: string;
  borderLight: string;
  borderHover: string;
  bgHover: string;
  iconBg: string;
  inputBg: string;
  accent: string;
}

/**
 * Hook centralizado para manejar clases de tema consistentes
 * Optimizado con useMemo para evitar recreación en cada render
 */
export const useThemeClasses = (theme: 'light' | 'dark'): ThemeClasses => {
  return useMemo(() => {
    const isDark = theme === 'dark';

    return {
      bg: isDark ? 'bg-[#141413]' : 'bg-[#FAF9F5]',
      bgCard: isDark ? 'bg-[#1F1E1D]' : 'bg-[#E5E5E5]',
      text: isDark ? 'text-[#E5E4E0]' : 'text-[#141413]',
      textMuted: isDark ? 'text-[#E5E4E0]/70' : 'text-[#141413]/70',
      textSubtle: isDark ? 'text-[#6ccff6]' : 'text-[#141413]/60',
      textFaded: isDark ? 'text-[#E5E4E0]/50' : 'text-[#141413]/50',
      border: isDark ? 'border-[#1F1E1D]' : 'border-[#F5F4F0]',
      borderLight: isDark ? 'border-[#1F1E1D]' : 'border-[#F5F4F0]',
      borderHover: isDark ? 'hover:border-[#2A2A28]' : 'hover:border-[#E0E0E0]',
      bgHover: isDark ? 'hover:bg-[#1F1E1D]' : 'hover:bg-[#F5F4F0]',
      iconBg: isDark ? 'bg-[#141413]' : 'bg-white',
      inputBg: isDark ? 'bg-[#1F1E1D]' : 'bg-[#F5F4F0]',
      accent: 'bg-[#6ccff6]'
    };
  }, [theme]);
};

/**
 * Versión simplificada para componentes que solo necesitan clases básicas
 */
export const useBasicThemeClasses = (theme: 'light' | 'dark') => {
  return useMemo(() => {
    const isDark = theme === 'dark';
    return {
      bg: isDark ? 'bg-[#141413]' : 'bg-[#FAF9F5]',
      bgCard: isDark ? 'bg-[#1F1E1D]' : 'bg-[#E5E5E5]',
      text: isDark ? 'text-[#E5E4E0]' : 'text-[#141413]',
      border: isDark ? 'border-[#1F1E1D]' : 'border-[#F5F4F0]',
    };
  }, [theme]);
};