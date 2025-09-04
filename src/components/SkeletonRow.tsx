import React from 'react';

export function SkeletonRow({ height = 40 }: { height?: number }) {
  return (
    <div
      style={{ height }}
      className="animate-pulse bg-gray-100 rounded w-full flex items-center"
      role="row"
      aria-busy="true"
    >
      <div className="h-4 bg-gray-300 rounded w-1/3 mx-2" />
      <div className="h-4 bg-gray-300 rounded w-1/4 mx-2" />
      <div className="h-4 bg-gray-300 rounded w-1/6 mx-2" />
    </div>
  );
}
