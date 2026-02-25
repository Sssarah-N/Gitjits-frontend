import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Countries from './Countries';

jest.mock('axios');

const mockCountriesData = {
  Countries: [
    {
      name: 'USA',
      code: 'US',
      capital: 'Washington, D.C.',
      population: 331000000,
      continent: 'North America'
    },
    {
      name: 'Canada',
      code: 'CA',
      capital: 'Ottawa',
      population: 38000000,
      continent: 'North America'
    }
  ]
};

const mockStatistics = {
  Statistics: {
    total_countries: 2,
    total_states: 5,
    total_cities: 10,
    total_parks: 15
  }
};

describe('Countries Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays statistics correctly', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/countries')) {
        return Promise.resolve({ data: mockCountriesData });
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ data: mockStatistics });
      }
    });

    render(
      <BrowserRouter>
        <Countries />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Countries: 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Total States: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Cities: 10/i)).toBeInTheDocument();
    });
  });

  test('displays error message when API fails', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Countries />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/There was a problem retrieving the data/i)).toBeInTheDocument();
    });
  });

  test('displays no data message when countries list is empty', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/countries')) {
        return Promise.resolve({ data: { Countries: [] } });
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ data: mockStatistics });
      }
    });

    render(
      <BrowserRouter>
        <Countries />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No countries found/i)).toBeInTheDocument();
    });
  });
});
