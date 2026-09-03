'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = 'records',
}: PaginationProps) {
  if (totalItems <= itemsPerPage && totalPages <= 1) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis if many pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 mt-6 border-t border-[#E5D9C8] text-xs text-[#6B5E55]">
      {/* Records Count Info */}
      <div className="font-medium">
        Showing <span className="font-bold text-[#292522]">{startItem}</span> to{' '}
        <span className="font-bold text-[#292522]">{endItem}</span> of{' '}
        <span className="font-bold text-[#292522]">{totalItems}</span> {itemLabel}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E5D9C8] bg-[#FFFDFC] text-[#292522] hover:bg-[#EDE4D5] hover:text-[#713B32] disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold shadow-sm cursor-pointer active:scale-95"
          aria-label="Previous Page"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numeric Page Buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-[#6B5E55] font-bold select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#713B32] text-white shadow-md'
                  : 'bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] hover:bg-[#EDE4D5] hover:text-[#713B32]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E5D9C8] bg-[#FFFDFC] text-[#292522] hover:bg-[#EDE4D5] hover:text-[#713B32] disabled:opacity-40 disabled:pointer-events-none transition-all font-semibold shadow-sm cursor-pointer active:scale-95"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
