import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignmentPage from '../app/assignment/[id]/page';

jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockImplementation(() => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      })),
      eq: jest.fn().mockImplementation(() => ({
        data: [{
          id: 'assignment-123',
          title: 'Test Assignment',
          description: 'Test description',
          problem: 'Test problem',
          setup: false,
          user_id: 'user-123',
          language: 'python',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          assigned_to: 5
        }],
        error: null,
        single: jest.fn().mockReturnValue({
          data: { language: 'python' },
          error: null
        })
      })),
      upsert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        download: jest.fn().mockImplementation((path) => {
          if (path.includes('submissions')) {
            return Promise.resolve({ data: null, error: { message: 'No submission' } });
          }
          return Promise.resolve({ 
            data: new Blob(['test skeleton code'], { type: 'text/plain' }), 
            error: null 
          });
        }),
      }),
    },
  }))
}));

jest.mock('../components/context/user-context', () => ({
  useUserContext: jest.fn(() => ({
    user: { id: 'user-123' },
    name: 'Test User'
  }))
}));

jest.mock('../components/ui/code-comparison', () => ({ __esModule: true, default: () => <div data-testid="code-comparison" /> }));
jest.mock('../components/edit-assignment', () => ({ __esModule: true, default: () => <div data-testid="edit-assignment" /> }));
jest.mock('../components/view-submissions', () => ({ __esModule: true, default: () => <div data-testid="view-submissions" /> }));
jest.mock('../components/ui/spinner', () => ({ LoadingSpinner: () => <div data-testid="loading-spinner" /> }));
jest.mock('../components/leaderboard', () => ({ __esModule: true, default: () => <div data-testid="leaderboard" /> }));
jest.mock('../components/ui/use-toast', () => ({ toast: jest.fn() }));


global.fetch = jest.fn((url) => {
  if (url.toString().includes('/api/execute-python')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        results: { 
          run: 5, 
          passed: 3, 
          failed: 2,
          avgExecutionTime: 0.5,
          avgMemoryUsage: 10
        }
      }),
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;

describe('AssignmentPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {

    test('renders page title', async () => {
      await act(async () => {
        render(<AssignmentPage params={{ id: 'assignment-123' }} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Test Assignment')).toBeInTheDocument();
      });
    });

    test('renders assignment details', async () => {
      await act(async () => {
        render(<AssignmentPage params={{ id: 'assignment-123' }} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByText('Test problem')).toBeInTheDocument();
      });
    });
  });

  describe('Accordion Functionality', () => {
    test('renders accordion sections', async () => {
      await act(async () => {
        render(<AssignmentPage params={{ id: 'assignment-123' }} />);
      });
      await waitFor(() => {
        expect(screen.getByText('Skeleton Code')).toBeInTheDocument();
        expect(screen.getByText('Leaderboard')).toBeInTheDocument();
      });
    });
  });

  describe('Download Functionality', () => {
    test('allows downloading skeleton code', async () => {
      const createObjectURL = jest.fn(() => 'mock-url');
      const revokeObjectURL = jest.fn();
      window.URL.createObjectURL = createObjectURL;
      window.URL.revokeObjectURL = revokeObjectURL;
  
      await act(async () => {
        render(<AssignmentPage params={{ id: 'assignment-123' }} />);
      });
  
      await waitFor(() => {
        const downloadButton = screen.getByText('Download Files');
        fireEvent.click(downloadButton);
      });
  
      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
    });
  });
  

  describe('Owner Functionality', () => {
    test('renders edit and delete buttons for assignment owner', async () => {
      await act(async () => {
        render(<AssignmentPage params={{ id: 'assignment-123' }} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Edit Assignment')).toBeInTheDocument();
        expect(screen.getByText('View Submissions')).toBeInTheDocument();
        expect(screen.getByText('Delete Assignment')).toBeInTheDocument();
      });
    });

  });

  describe('Error Handling', () => {
    test('handles submission upload error', async () => {
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: false,
          statusText: 'Test error'
        })
      ) as jest.Mock;

      const mockFile = new File(['test content'], 'test.zip', { type: 'application/zip' });

      await act(async () => {
        render(<AssignmentPage params={{ id: 'assignment-123' }} />);
      });
    });
  });
});