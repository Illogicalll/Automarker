import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignmentsPage from '../app/assignments/page';
import { useUserContext } from '../components/context/user-context';
import { createClient } from '../utils/supabase/client';

// Mock dependencies
jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('../components/context/user-context', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('../components/assignment-list', () => {
  return ({ assignments, isMyAssignments }: { assignments: any[] | null | number, isMyAssignments: boolean }) => (
    <div data-testid={`assignment-list-${isMyAssignments ? 'my' : 'assigned'}`}>
      {assignments === null && <div>Loading</div>}
      {assignments === 1 && <div>No assignments</div>}
      {Array.isArray(assignments) && assignments.map((assignment) => (
        <div key={assignment.id} data-testid="assignment-item">{assignment.title}</div>
      ))}
    </div>
  );
});

describe('AssignmentsPage Component', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
  };

  const mockUser = { id: 'user-123' };
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);

  const mockMyAssignments = [
    { id: 'assignment-1', title: 'My Assignment 1', user_id: 'user-123', due_date: futureDate.toISOString() },
    { id: 'assignment-2', title: 'My Assignment 2', user_id: 'user-123', due_date: futureDate.toISOString() },
  ];

  const mockGroups = [
    { id: 'group-1', users: ['user-123'] },
  ];

  const mockAssignedToMe = [
    { id: 'assignment-3', title: 'Assigned Assignment 1', assigned_to: 'group-1', due_date: futureDate.toISOString() },
    { id: 'assignment-4', title: 'Assigned Assignment 2', assigned_to: 'group-1', due_date: futureDate.toISOString() },
  ];

  const mockArchivedAssignments = [
    { id: 'assignment-5', title: 'Archived Assignment 1', due_date: pastDate.toISOString() },
    { id: 'assignment-6', title: 'Archived Assignment 2', due_date: pastDate.toISOString() },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Supabase client
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Mock user context
    (useUserContext as jest.Mock).mockReturnValue({
      user: mockUser,
      name: 'Test User',
    });

    // Mock Supabase responses
    mockSupabase.from.mockImplementation((table) => {
      switch (table) {
        case 'assignments':
          return {
            select: () => ({
              eq: () => ({
                data: table === 'assignments' && this.method === 'my' ? mockMyAssignments : null,
                error: null,
              }),
              in: () => ({
                data: table === 'assignments' && this.method === 'assigned' ? mockAssignedToMe : null,
                error: null,
              }),
            }),
          };
        case 'groups':
          return {
            select: () => ({
              contains: () => ({
                data: mockGroups,
                error: null,
              }),
            }),
          };
        default:
          return {};
      }
    });
  });

  test('renders page titles', async () => {
    render(<AssignmentsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('My Assignments')).toHaveLength(1);
      expect(screen.getAllByText('Assigned to Me')).toHaveLength(1);
      expect(screen.getAllByText('Archive')).toHaveLength(1);
    });
  });

  test('renders My Assignments list', async () => {
    render(<AssignmentsPage />);

    await waitFor(() => {
      const myAssignmentsList = screen.getAllByTestId('assignment-list-my');
      expect(myAssignmentsList).toHaveLength(1);
    });
  });

  test('renders Assigned to Me list', async () => {
    render(<AssignmentsPage />);

    await waitFor(() => {
      const assignedToMeList = screen.getAllByTestId('assignment-list-assigned');
      expect(assignedToMeList).toHaveLength(2);

    });
  });

  test('handles no assignments scenarios', async () => {
    // Mock empty assignments
    mockSupabase.from.mockImplementation((table) => {
      switch (table) {
        case 'assignments':
          return {
            select: () => ({
              eq: () => ({ data: [], error: null }),
              in: () => ({ data: [], error: null }),
            }),
          };
        case 'groups':
          return {
            select: () => ({
              contains: () => ({
                data: mockGroups,
                error: null,
              }),
            }),
          };
        default:
          return {};
      }
    });

    render(<AssignmentsPage />);

    await waitFor(() => {
      const noAssignmentLists = screen.getAllByText('No assignments');
      expect(noAssignmentLists).toHaveLength(3);
    });
  });

  test('handles Supabase errors', async () => {
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock Supabase error
    mockSupabase.from.mockImplementation((table) => {
      switch (table) {
        case 'assignments':
          return {
            select: () => ({
              eq: () => ({ data: null, error: new Error('Assignments fetch error') }),
              in: () => ({ data: null, error: new Error('Assigned assignments fetch error') }),
            }),
          };
        case 'groups':
          return {
            select: () => ({
              contains: () => ({
                data: null,
                error: new Error('Groups fetch error'),
              }),
            }),
          };
        default:
          return {};
      }
    });

    render(<AssignmentsPage />);

    // Wait and check that console.error was called
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching my assignments:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching my assignments:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching my assignments:',
        expect.any(Error)
      );
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('does not fetch assignments when no user is logged in', async () => {
    // Mock user context with no user
    (useUserContext as jest.Mock).mockReturnValue({
      user: null,
      name: null,
    });

    // Create a spy to check if Supabase select method is called
    const selectSpy = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: selectSpy,
    });

    render(<AssignmentsPage />);

    // Wait a moment to ensure no fetch occurs
    await waitFor(() => {
      expect(selectSpy).not.toHaveBeenCalled();
    });
  });
});