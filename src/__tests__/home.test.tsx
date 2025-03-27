import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedPage from '../app/home/page';
import { useUserContext } from '../components/context/user-context';

jest.mock('../components/context/user-context', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('../components/ui/sparkles-text', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock('../components/ui/spinner', () => ({
  LoadingSpinner: ({ size }: { size: string | number }) => <div data-testid="loading-spinner" style={{ fontSize: size }} />,
}));

jest.mock('../components/ui/bento-grid', () => ({
  BentoGrid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BentoCard: ({ name, description, href, Icon }: { name: string; description: string; href: string; Icon: React.FC }) => (
    <div>
      <Icon />
      <h3>{name}</h3>
      <p>{description}</p>
      <a href={href}>{href}</a>
    </div>
  ),
}));

describe('ProtectedPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message with user name', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    render(<ProtectedPage />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back,')).toBeInTheDocument();
    });
  });

  test('renders loading spinner when user data is not available', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: null,
      name: null,
    });

    render(<ProtectedPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  test('renders BentoGrid with BentoCards when user data is available', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    render(<ProtectedPage />);

    await waitFor(() => {
      const cards = screen.getAllByRole('link');
      expect(cards).toHaveLength(3);
    });

    expect(screen.getByText('Your Assignments')).toBeInTheDocument();
    expect(screen.getByText('Your Groups')).toBeInTheDocument();
    expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
  });

  test('renders correct feature details', async () => {
    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
      name: 'Test User',
    });

    render(<ProtectedPage />);

    await waitFor(() => {
      expect(screen.getByText('Your Assignments')).toBeInTheDocument();
      expect(screen.getByText('Browse new tasks and see your old results')).toBeInTheDocument();
      
      expect(screen.getByText('Your Groups')).toBeInTheDocument();
      expect(screen.getByText('See and manage which classes you are a part of')).toBeInTheDocument();

      expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Change your display name and anonymity settings')).toBeInTheDocument();
    });
  });
});
