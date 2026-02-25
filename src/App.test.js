import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/countries/i)).toBeInTheDocument();
  });

  test('renders navbar', () => {
    const { container } = render(<App />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});
