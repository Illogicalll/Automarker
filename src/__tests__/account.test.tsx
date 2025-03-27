import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountForm from '../components/account-form';
import { createClient } from '../utils/supabase/client';
import { useUserContext } from '../components/context/user-context';

jest.mock('lucide-react', () => ({
  Mail: (props: any) => <div data-testid="mail-icon" {...props} />,
  ALargeSmall: (props: any) => <div data-testid="name-icon" {...props} />,
}));

jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('../components/ui/shiny-button', () => {
  return ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <button data-testid="shiny-button" className={className}>{children}</button>
  );
});

jest.mock('../components/context/user-context', () => ({
  useUserContext: jest.fn(),
}));

describe('AccountForm Component', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (useUserContext as jest.Mock).mockReturnValue({
      user: mockUser,
      name: 'Test User',
      checkUser: jest.fn(),
    });

    global.alert = jest.fn();
  });

  test('renders account form with user details', () => {
    render(<AccountForm />);

    expect(screen.getByText('My Profile')).toBeInTheDocument();

    const emailElement = screen.getByText('test@example.com');
    expect(emailElement).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Test User');
    expect(nameInput).toBeInTheDocument();

    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('name-icon')).toBeInTheDocument();
  });

  test('updates profile successfully', async () => {
    const mockCheckUser = jest.fn();
    (useUserContext as jest.Mock).mockReturnValue({
      user: mockUser,
      name: 'Test User',
      checkUser: mockCheckUser,
    });

    render(<AccountForm />);

    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const updateButton = screen.getByTestId('shiny-button');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.upsert).toHaveBeenCalledWith({
        id: 'test-user-id',
        full_name: 'Updated Name',
        avatar_url: null,
        updated_at: expect.any(String),
      });

      expect(global.alert).toHaveBeenCalledWith('Profile updated!');

      expect(mockCheckUser).toHaveBeenCalled();
    });
  });

  test('handles update error', async () => {
    mockSupabase.upsert.mockResolvedValue({ error: new Error('Update failed') });

    render(<AccountForm />);

    const updateButton = screen.getByTestId('shiny-button');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error updating the data!');
    });
  });
});