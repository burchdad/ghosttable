import React, { createContext, useContext } from 'react';

export const GridContext = createContext<any>(null);

export function useGridContext() {
  return useContext(GridContext);
}
