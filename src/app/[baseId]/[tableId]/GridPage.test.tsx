import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridPage from './page';

describe('GridPage Accessibility & Integration', () => {
  it('renders grid and controls', () => {
    render(<GridPage />);
    expect(screen.getByLabelText(/Grid controls/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Grid table/i)).toBeInTheDocument();
    expect(screen.getByText(/Grid/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<GridPage />);
    const table = screen.getByLabelText(/Grid table/i);
    table.focus();
    fireEvent.keyDown(table, { key: 'ArrowRight' });
    // Add more assertions for cell focus movement
  });

  it('shows loading indicator when saving cell', () => {
    // Simulate cell save and check for spinner
    // This would require mocking saveCell and triggering a change
  });

  it('shows activity log', () => {
    render(<GridPage />);
    expect(screen.getByText(/Activity Log/i)).toBeInTheDocument();
  });

  it('has ARIA live region for announcements', () => {
    render(<GridPage />);
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});
