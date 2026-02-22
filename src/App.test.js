import { render, screen } from '@testing-library/react';
import App from './App';

test('renders countries link', () => {
  render(<App />);
  const linkElement = screen.getByText(/countries/i);
  expect(linkElement).toBeInTheDocument();
});
