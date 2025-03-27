import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPassword from '../app/(auth-pages)/forgot-password/page';

jest.mock('../components/form-message', () => ({
  FormMessage: ({ message }: { message: any }) => <div data-testid="form-message">{message?.type}</div>,
}));

jest.mock('../components/submit-button', () => ({
  SubmitButton: ({ children, formAction }: { children: React.ReactNode, formAction: any }) => (
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
  forgotPasswordAction: jest.fn(),
}));

describe('ForgotPassword Page', () => {
  const mockSearchParams = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders page components correctly', () => {
    render(<ForgotPassword searchParams={mockSearchParams} />);

    const logo = screen.getByTestId('logo-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');

    expect(screen.getAllByText('Reset Password')).toHaveLength(2);

    expect(screen.getByTestId('label-email')).toBeInTheDocument();

    const emailInput = screen.getByTestId('input-email');
    
    expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    expect(emailInput).toBeRequired();

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Reset Password');

    const signInLink = screen.getByTestId('link-sign-in');
    expect(signInLink).toHaveTextContent('Sign in');
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  test('renders form message when provided', () => {
    const errorMessage = { type: 'error', content: 'Test error' };
    render(<ForgotPassword searchParams={errorMessage} />);

    const formMessage = screen.getByTestId('form-message');
    expect(formMessage).toHaveTextContent('error');
  });
});