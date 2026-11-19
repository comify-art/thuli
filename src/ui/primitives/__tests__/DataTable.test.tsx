import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DataTable, type ColumnDef } from '../DataTable';

interface TestItem {
  id: string;
  name: string;
  role: string;
  count: number;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Alice Smith', role: 'admin', count: 10 },
  { id: '2', name: 'Bob Jones', role: 'member', count: 5 },
  { id: '3', name: 'Charlie Brown', role: 'member', count: 20 },
];

const mockColumns: ColumnDef<TestItem>[] = [
  {
    key: 'name',
    header: 'Name',
    field: 'name',
    sortable: true,
    render: (item) => item.name,
  },
  {
    key: 'role',
    header: 'Role',
    field: 'role',
    render: (item) => item.role,
  },
  {
    key: 'count',
    header: 'Count',
    field: 'count',
    align: 'right',
    render: (item) => String(item.count),
  },
];

describe('DataTable Component', () => {
  it('renders tabular data with columns and rows', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('renders loading state when loading is true', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        loading={true}
        loadingMessage="Fetching audit logs..."
      />
    );

    expect(screen.getByText('Fetching audit logs...')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        emptyTitle="No Audit Logs"
        emptyDescription="No events match your search."
      />
    );

    expect(screen.getByText('No Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('No events match your search.')).toBeInTheDocument();
  });

  it('supports sorting when headers are clicked', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
      />
    );

    const sortButton = screen.getByTitle('Sort by Name');
    fireEvent.click(sortButton);

    // After clicking sort asc on name: Alice, Bob, Charlie
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Alice Smith');

    // Click again for desc: Charlie, Bob, Alice
    fireEvent.click(sortButton);
    const cellsDesc = screen.getAllByRole('cell');
    expect(cellsDesc[0]).toHaveTextContent('Charlie Brown');
  });

  it('triggers onRowClick when a row is clicked', () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
      />
    );

    const rowCell = screen.getByText('Alice Smith');
    fireEvent.click(rowCell);
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });
});
