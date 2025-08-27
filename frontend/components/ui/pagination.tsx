'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Se o total de páginas é menor que o máximo visível, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);
      
      // Ajusta se estamos no início
      if (currentPage <= halfVisible) {
        endPage = Math.min(totalPages, maxVisiblePages);
      }
      
      // Ajusta se estamos no final
      if (currentPage > totalPages - halfVisible) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }
      
      // Adiciona primeira página e ellipsis se necessário
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis');
        }
      }
      
      // Adiciona páginas visíveis
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Adiciona ellipsis e última página se necessário
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className={cn('flex items-center justify-center space-x-1', className)}>
      {/* Botão Primeira Página */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="hidden sm:flex"
        >
          Primeira
        </Button>
      )}
      
      {/* Botão Página Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Anterior</span>
      </Button>
      
      {/* Números das Páginas */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
            );
          }
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[40px]',
                currentPage === page && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>
      
      {/* Botão Próxima Página */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center"
      >
        <span className="hidden sm:inline mr-1">Próxima</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Botão Última Página */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:flex"
        >
          Última
        </Button>
      )}
    </nav>
  );
}

// Componente de informações da paginação
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = '',
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('text-sm text-gray-600', className)}>
      Mostrando {startItem} a {endItem} de {totalItems} resultado{totalItems !== 1 ? 's' : ''}
      {totalPages > 1 && (
        <span className="ml-2">
          (Página {currentPage} de {totalPages})
        </span>
      )}
    </div>
  );
}

export default Pagination;