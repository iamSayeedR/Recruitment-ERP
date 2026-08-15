import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { DataTable, Column } from './index';

interface TestData {
  id: number;
  name: string;
  age: number;
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 },
];

const mockColumns: Column<TestData>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} emptyMessage="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('calls onSort when sortable column header is clicked', () => {
    const handleSort = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onSort={handleSort} />);
    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name');
  });

  it('renders pagination controls and calls onPageChange when buttons clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        pagination={{
          page: 2,
          pageSize: 10,
          total: 50,
          onPageChange: handlePageChange
        }} 
      />
    );
    expect(screen.getByText(/showing 11 to 20 of 50 results/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(handlePageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
