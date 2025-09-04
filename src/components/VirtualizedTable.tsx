import React, { memo } from 'react';
import { List } from 'react-window';
import { SkeletonRow } from './SkeletonRow';

export function VirtualizedTable({ rows, rowHeight = 40, width = 800, height = 600, renderRow, loading = false }: any) {
  const MemoRow = memo(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} role="row" tabIndex={0} aria-rowindex={index + 1}>
      {renderRow(rows[index], index)}
    </div>
  ));

  if (loading) {
    // Show skeleton rows while loading
    return (
      <div style={{ width, height }}>
        {Array.from({ length: Math.floor(height / rowHeight) }).map((_, i) => (
          <SkeletonRow key={i} height={rowHeight} />
        ))}
      </div>
    );
  }

  return (
    <List
      rowCount={rows.length}
      rowHeight={rowHeight}
      defaultHeight={height}
      overscanCount={6}
      rowComponent={MemoRow}
      rowProps={{}}
      style={{ width, height }}
    />
  );
}
