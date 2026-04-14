import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import StateDetail from './StateDetail';

jest.mock('axios');
jest.mock('../StateMap/StateMap', () => function MockStateMap() {
  return <div data-testid="state-map">State Map</div>;
});

function renderWithRoute(path = '/countries/US/states/CA') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/countries/:countryCode/states/:stateCode" element={<StateDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

const mockStateData = {
  State: {
    name: 'California',
    state_code: 'CA',
    country_code: 'US',
    capital: 'Sacramento',
    population: 39538223,
  },
};

const mockParksData = {
  Parks: [
    {
      park_code: 'yose',
      name: 'Yosemite National Park',
      city: 'Yosemite Valley',
      state_code: ['CA', 'NV'],
      type: 'National Park',
      latitude: 37.8651,
      longitude: -119.5383,
    },
  ],
};

describe('StateDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays state and parks correctly', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/countries/US/states/CA')) {
        return Promise.resolve({ data: mockStateData });
      }

      if (url.includes('/parks/state/CA')) {
        return Promise.resolve({ data: mockParksData });
      }

      return Promise.reject(new Error('Unexpected URL'));
    });

    renderWithRoute();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'California' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Parks \(1\)/i })).toBeInTheDocument();
      expect(screen.getByText('Yosemite National Park')).toBeInTheDocument();
    });
  });

  test('displays no parks message when parks list is empty', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/countries/US/states/CA')) {
        return Promise.resolve({ data: mockStateData });
      }

      if (url.includes('/parks/state/CA')) {
        return Promise.resolve({ data: { Parks: [] } });
      }

      return Promise.reject(new Error('Unexpected URL'));
    });

    renderWithRoute();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'California' })).toBeInTheDocument();
      expect(screen.getByText(/No parks found for this state\./i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Parks \(0\)/i })).toBeInTheDocument();
    });
  });

  test('displays error message when API fails', async () => {
    axios.get.mockRejectedValue(new Error('API error'));

    renderWithRoute();

    await waitFor(() => {
      expect(screen.getByText(/There was a problem retrieving the state data\./i)).toBeInTheDocument();
    });
  });
});
