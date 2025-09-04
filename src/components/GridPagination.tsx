import React from 'react';

export function GridPagination({ page, pageSize, total, onPageChange }: any) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="flex items-center justify-between py-2">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="px-2 py-1 border rounded">Prev</button>
      <span className="mx-2">Page {page} of {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="px-2 py-1 border rounded">Next</button>
    </div>
  );
}
