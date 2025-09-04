import React from 'react';
import { Cell } from './Cell';

export function RecordRow({ record, visibleFields, ...props }: any) {
  // Keyboard navigation handler
  const rowRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const cells = Array.from(row.querySelectorAll('[role="cell"]'));
      const active = document.activeElement;
      const idx = cells.indexOf(active as HTMLElement);
      if (e.key === 'ArrowRight' && idx < cells.length - 1) {
        (cells[idx + 1] as HTMLElement).focus();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        (cells[idx - 1] as HTMLElement).focus();
        e.preventDefault();
      } else if (e.key === 'Enter' && active) {
        // Optionally trigger cell edit mode
        (active as HTMLElement).click();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        row.focus();
        e.preventDefault();
      }
    };
    row.addEventListener('keydown', handleKeyDown);
    return () => row.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <div
      ref={rowRef}
      className="flex w-full border-b bg-white hover:bg-gray-50 focus-within:bg-blue-50 transition-colors duration-150"
      role="row"
      aria-rowindex={props['aria-rowindex']}
      tabIndex={0}
      style={{ minWidth: 0 }}
    >
      <div className="border px-2 py-2 w-20" role="cell" tabIndex={-1} aria-label="Actions">
        {/* Actions can be added here */}
      </div>
      {visibleFields.map((field: any) => (
        <div
          key={field.id}
          className="border px-4 py-2 flex-1 min-w-0"
          role="cell"
          tabIndex={0}
          aria-label={field.name}
        >
          <Cell record={record} field={field} />
        </div>
      ))}
    </div>
  );
}
