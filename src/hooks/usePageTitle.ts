import { useEffect } from 'react';

/**
 * Hook para atualizar o título da página dinamicamente
 * @param title - Título da página (sem o prefixo "GreenRush")
 * @param includeBrand - Se deve incluir "GreenRush" no início (padrão: true)
 */
export const usePageTitle = (title: string, includeBrand: boolean = true) => {
  useEffect(() => {
    const previousTitle = document.title;
    
    document.title = includeBrand 
      ? `GreenRush - ${title}`
      : title;

    // Cleanup: restaura o título anterior quando o componente desmonta
    return () => {
      document.title = previousTitle;
    };
  }, [title, includeBrand]);
};
