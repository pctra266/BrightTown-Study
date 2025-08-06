import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-6 space-x-1">
      <button
        disabled={currentPage === 1}
        className={`px-3 py-1 border rounded-l ${currentPage === 1 ? "bg-gray-200 cursor-not-allowed" : "hover:bg-purple-100"}`}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 border ${page === currentPage ? "bg-purple-500 text-white" : "hover:bg-purple-100"}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        className={`px-3 py-1 border rounded-r ${currentPage === totalPages ? "bg-gray-200 cursor-not-allowed" : "hover:bg-purple-100"}`}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
