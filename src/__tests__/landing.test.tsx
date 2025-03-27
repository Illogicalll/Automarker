import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Index from '../app/page';

jest.mock('../components/languages', () => ({
  __esModule: true,
  default: () => <div data-testid="languages">Languages Component</div>,
}));

describe('Index Component', () => {

  test('renders the Languages component', () => {
    render(<Index />);

    expect(screen.getByTestId('languages')).toBeInTheDocument();
  });

  test('renders the "Compatible with all the popular languages" text', () => {
    render(<Index />);

    expect(screen.getByText('Compatible with all the popular languages')).toBeInTheDocument();
  });

  test('renders the "More coming soon!" text', () => {
    render(<Index />);

    expect(screen.getByText('More coming soon!')).toBeInTheDocument();
  });

  test('has the correct class names for styling', () => {
    const { container } = render(<Index />);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('w-full');
    expect(container.firstChild).toHaveClass('h-full');
    expect(container.firstChild).toHaveClass('text-center');
    expect(container.firstChild).toHaveClass('container-gap');
    expect(container.firstChild).toHaveClass('text-balance');
  });
});
