import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../app/(auth-pages)/sign-in/page';

jest.mock('../components/form-message', () => ({
  FormMessage: ({ message }: { message: any }) => <div data-testid="form-message">{message?.type}</div>,
}));

jest.mock('../components/submit-button', () => ({
  SubmitButton: ({ children, pendingText, formAction }: { children: React.ReactNode, pendingText: string, formAction: any }) => (
    <button data-testid="submit-button">{children}</button>
  ),
}));

jest.mock('../components/ui/input', () => ({
  Input: (props: any) => <input data-testid={`input-${props.name}`} {...props} />,
}));

jest.mock('../components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) => (
    <label data-testid={`label-${htmlFor}`}>{children}</label>
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) => (
    <a data-testid={`link-${href.replace(/^\//, '')}`} href={href} className={className}>{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img data-testid="logo-image" {...props} />,
}));

jest.mock('../app/actions', () => ({
  signInAction: jest.fn(),
}));

describe('Login Page', () => {
  const mockSearchParams = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders page components correctly', () => {
    render(<Login searchParams={mockSearchParams} />);

    const logo = screen.getByTestId('logo-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');

    expect(screen.getAllByText('Sign in')).toHaveLength(2);

    expect(screen.getByTestId('label-email')).toBeInTheDocument();
    expect(screen.getByTestId('label-password')).toBeInTheDocument();

    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-password');
    
    expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Your password');
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Sign in');

    const forgotPasswordLink = screen.getByTestId('link-forgot-password');
    expect(forgotPasswordLink).toHaveTextContent('Forgot Password?');
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');

    const signUpLink = screen.getByTestId('link-sign-up');
    expect(signUpLink).toHaveTextContent('Sign up');
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });

  test('renders form message when provided', () => {
    const errorMessage = { type: 'error', content: 'Test error' };
    render(<Login searchParams={errorMessage} />);

    const formMessage = screen.getByTestId('form-message');
    expect(formMessage).toHaveTextContent('error');
  });
});