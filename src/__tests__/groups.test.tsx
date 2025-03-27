import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Groups from '../app/groups/page';
import { useUserContext } from '../components/context/user-context';
import { createClient } from '../utils/supabase/client';

jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('../components/context/user-context', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('../components/group-list', () => {
  return ({ groups }: { groups: any[] | null | number }) => (
    <div data-testid="group-list">
      {groups === null && <div>Loading</div>}
      {groups === 1 && <div>No groups found</div>}
      {Array.isArray(groups) && groups.map((group) => (
        <div key={group.id} data-testid="group-item">{group.name}</div>
      ))}
    </div>
  );
});

describe('Groups Page Component', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  test('renders page title', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: [],
          error: null,
        }),
      }),
    });

    render(<Groups />);

    await waitFor(() => {
      expect(screen.getByText('My Groups')).toBeInTheDocument();
    });
  });

  test('renders GroupList with no groups', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: [],
          error: null,
        }),
      }),
    });

    render(<Groups />);

    await waitFor(() => {
      expect(screen.getByTestId('group-list')).toBeInTheDocument();
      expect(screen.getByText('No groups found')).toBeInTheDocument();
    });
  });

  test('renders GroupList with existing groups', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    const mockGroups = [
      { id: 'group-1', name: 'Group One', owner: 'user-123' },
      { id: 'group-2', name: 'Group Two', owner: 'user-123' },
    ];

    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: mockGroups,
          error: null,
        }),
      }),
    });

    render(<Groups />);

    await waitFor(() => {
      expect(screen.getByTestId('group-list')).toBeInTheDocument();
      expect(screen.getByText('Group One')).toBeInTheDocument();
      expect(screen.getByText('Group Two')).toBeInTheDocument();

      const groupItems = screen.getAllByTestId('group-item');
      expect(groupItems).toHaveLength(2);
    });
  });

  test('handles Supabase error when fetching groups', async () => {

    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: null,
          error: new Error('Supabase fetch error'),
        }),
      }),
    });

    render(<Groups />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching groups:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('does not fetch groups when no user is logged in', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: null,
      name: null,
    });

    const selectSpy = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: selectSpy,
    });

    render(<Groups />);

    await waitFor(() => {
      expect(selectSpy).not.toHaveBeenCalled();
    });
  });
});