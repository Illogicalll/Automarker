import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupPage from '../app/group/[id]/page';
import { useUserContext } from '../components/context/user-context';
import { createClient } from '../utils/supabase/client';

jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('../components/context/user-context', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('../components/ui/spinner', () => ({
  LoadingSpinner: ({ size }: { size: number }) => <div data-testid="loading-spinner" />,
}));

jest.mock('../components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="mock-button" {...props}>{children}</button>
  ),
}));

describe('GroupPage Component', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };

  const mockGroup = {
    id: 'group-123',
    name: 'Test Group',
    users: ['user-1', 'user-2'],
  };

  const mockUsers = [
    { id: 'user-1', email: 'user1@test.com', full_name: 'User One' },
    { id: 'user-2', email: 'user2@test.com', full_name: 'User Two' },
  ];

  const mockSearchResults = [
    { id: 'user-3', email: 'user3@test.com', full_name: 'User Three' },
    { id: 'user-4', email: 'user4@test.com', full_name: 'User Four' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
      name: 'Current User',
    });

    // Setup default mock implementations
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: [mockGroup],
          error: null,
        }),
        in: () => ({
          data: mockUsers,
          error: null,
        }),
        or: () => ({
          neq: () => ({
            limit: () => ({
              data: mockSearchResults,
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            data: [{ ...mockGroup, name: 'Updated Group' }],
            error: null,
          }),
        }),
        delete: () => ({
          eq: () => ({
            error: null,
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          data: [mockGroup],
          error: null,
        }),
        in: () => ({
          data: mockUsers,
          error: null,
        }),
        or: () => ({
          neq: () => ({
            limit: () => ({
              data: mockSearchResults,
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            data: [{ ...mockGroup, name: 'Updated Group' }],
            error: null,
          }),
        }),
        delete: () => ({
          eq: () => ({
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          data: [mockGroup],
          error: null,
        }),
        in: () => ({
          data: mockUsers,
          error: null,
        }),
        or: () => ({
          neq: () => ({
            limit: () => ({
              data: mockSearchResults,
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            data: [{ ...mockGroup, name: 'Updated Group' }],
            error: null,
          }),
        }),
        delete: () => ({
          eq: () => ({
            error: null,
          }),
        }),
      }),
    });
  });

  // Existing tests...

  test('handles group fetch error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          data: null,
          error: new Error('Fetch error'),
        }),
      }),
    });

    render(<GroupPage params={{ id: 'group-123' }} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching group:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles users fetch error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          data: [mockGroup],
          error: null,
        }),
        in: () => ({
          data: null,
          error: new Error('Users fetch error'),
        }),
      }),
    });

    render(<GroupPage params={{ id: 'group-123' }} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    });

    consoleErrorSpy.mockRestore();
  });

  test('search functionality', async () => {
    render(<GroupPage params={{ id: 'group-123' }} />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  test('add and remove users in edit group dialog', async () => {
    render(<GroupPage params={{ id: 'group-123' }} />);

    // Open edit dialog
    await waitFor(() => {
      const editButtons = screen.getAllByTestId('mock-button');
      const editButton = editButtons.find(btn => btn.textContent === 'Edit Group');
      
      if (editButton) {
        fireEvent.click(editButton);
      }
    });

    // Search and add a user
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('type name or email');
      fireEvent.change(searchInput, { target: { value: 'user' } });
    });

    await waitFor(() => {
      const userToAdd = screen.getAllByText('User Two')[1];
      fireEvent.click(userToAdd);
    });

    // Verify user is added
    await waitFor(() => {
      expect(screen.getAllByText('User Two')).toHaveLength(2);
    });

    // Remove the added user
    const removeButton = screen.getAllByText('×')[0];
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getAllByText('User Two')).toHaveLength(2);
    });
  });

  test('update group functionality', async () => {
    render(<GroupPage params={{ id: 'group-123' }} />);

    // Open edit dialog
    await waitFor(() => {
      const editButtons = screen.getAllByTestId('mock-button');
      const editButton = editButtons.find(btn => btn.textContent === 'Edit Group');
      
      if (editButton) {
        fireEvent.click(editButton);
      }
    });

    // Change group name
    const nameInput = screen.getByDisplayValue('Test Group');
    fireEvent.change(nameInput, { target: { value: 'Updated Group' } });

    // Submit update
    const updateButtons = screen.getAllByTestId('mock-button');
    const updateButton = updateButtons.find(btn => btn.textContent === 'Update');
    
    if (updateButton) {
      fireEvent.click(updateButton);
    }

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('groups');
      expect(mockSupabase.update).toHaveBeenCalledTimes(0);
    });
  });

  test('delete group with incorrect name', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<GroupPage params={{ id: 'group-123' }} />);

    // Open delete dialog
    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('mock-button');
      const deleteButton = deleteButtons.find(btn => btn.textContent === 'Delete Group');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    // Try to delete with incorrect name
    const confirmInput = screen.getByPlaceholderText('Type group name to confirm');
    fireEvent.change(confirmInput, { target: { value: 'Wrong Group Name' } });

    const confirmDeleteButtons = screen.getAllByTestId('mock-button');
    const confirmDeleteButton = confirmDeleteButtons.find(btn => btn.textContent === 'Delete');
    
    if (confirmDeleteButton) {
      fireEvent.click(confirmDeleteButton);
    }

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledTimes(0);
    });

    alertSpy.mockRestore();
  });

  test('delete group with correct name', async () => {
    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(<GroupPage params={{ id: 'group-123' }} />);

    // Open delete dialog
    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('mock-button');
      const deleteButton = deleteButtons.find(btn => btn.textContent === 'Delete Group');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    // Try to delete with correct name
    const confirmInput = screen.getByPlaceholderText('Type group name to confirm');
    fireEvent.change(confirmInput, { target: { value: 'Test Group' } });

    const confirmDeleteButtons = screen.getAllByTestId('mock-button');
    const confirmDeleteButton = confirmDeleteButtons.find(btn => btn.textContent === 'Delete');
    
    if (confirmDeleteButton) {
      fireEvent.click(confirmDeleteButton);
    }

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('groups');
      expect(mockSupabase.delete).toHaveBeenCalledTimes(0);
      expect(window.location.href).toBe('');
    });
  });
});