import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from '../app/(auth-pages)/sign-up/page';

jest.mock('../components/form-message', () => ({
  FormMessage: ({ message }: { message: any }) => <div data-testid="form-message">{message?.type || 'message'}</div>,
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
  signUpAction: jest.fn(),
}));

describe('Signup Page', () => {
  test('renders page components correctly', () => {
    render(<Signup searchParams={{}} />);

    const logo = screen.getByTestId('logo-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');

    expect(screen.getAllByText('Sign up')).toHaveLength(2);

    expect(screen.getByTestId('label-name')).toBeInTheDocument();
    expect(screen.getByTestId('label-email')).toBeInTheDocument();
    expect(screen.getByTestId('label-password')).toBeInTheDocument();

    const nameInput = screen.getByTestId('input-name');
    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-password');
    
    expect(nameInput).toHaveAttribute('placeholder', 'John Doe');
    expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', '********');
    
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute('minLength', '6');

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Sign up');

    const signInLink = screen.getByTestId('link-sign-in');
    expect(signInLink).toHaveTextContent('Sign in');
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  test('renders form message when provided', () => {
    const errorMessage = { type: 'error', content: 'Test error' };
    render(<Signup searchParams={errorMessage} />);

    const formMessage = screen.getByTestId('form-message');
    expect(formMessage).toHaveTextContent('error');
  });

  test('renders only form message when message search param is present', () => {
    const messageParam = { message: 'Test message' };
    render(<Signup searchParams={messageParam} />);

    const formMessage = screen.getByTestId('form-message');
    expect(formMessage).toHaveTextContent('message');

    const logo = screen.queryByTestId('logo-image');
    const submitButton = screen.queryByTestId('submit-button');
    
    expect(logo).not.toBeInTheDocument();
    expect(submitButton).not.toBeInTheDocument();
  });
});