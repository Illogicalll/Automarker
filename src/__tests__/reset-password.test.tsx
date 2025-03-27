import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPassword from '../app/reset-password/page';

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

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img data-testid="logo-image" {...props} />,
}));

jest.mock('../app/actions', () => ({
  resetPasswordAction: jest.fn(),
}));

describe('ResetPassword Page', () => {
  const mockSearchParams = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders page components correctly', async () => {
    render(await ResetPassword({ searchParams: mockSearchParams }));

    const logo = screen.getByTestId('logo-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByText('Please enter your new password below.')).toBeInTheDocument();

    expect(screen.getByTestId('label-password')).toBeInTheDocument();
    expect(screen.getByTestId('label-confirmPassword')).toBeInTheDocument();

    const passwordInput = screen.getByTestId('input-password');
    const confirmPasswordInput = screen.getByTestId('input-confirmPassword');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'New password');
    expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Confirm password');
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Reset password');
  });

  test('renders form message when provided', async () => {
    const errorMessage = { type: 'error', content: 'Test error' };
    render(await ResetPassword({ searchParams: errorMessage }));

    const formMessage = screen.getByTestId('form-message');
    expect(formMessage).toHaveTextContent('error');
  });
});