import React from 'react';
export function UndoRedo({ onUndo, onRedo }: { onUndo: () => void; onRedo: () => void }) {
  return (
    <div className="flex gap-2 mb-2">
      <button aria-label="Undo" onClick={onUndo} className="px-2 py-1 bg-gray-200 rounded">Undo</button>
      <button aria-label="Redo" onClick={onRedo} className="px-2 py-1 bg-gray-200 rounded">Redo</button>
    </div>
  );
}
