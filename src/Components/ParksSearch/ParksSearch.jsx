import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './ParksSearch.css';

const PARKS_ENDPOINT = `${BACKEND_URL}/parks`;
const SEARCH_ENDPOINT = `${BACKEND_URL}/parks/search`;

function Parks() {
  const [error, setError] = useState('');
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load all parks on mount
  useEffect(() => {
    setLoading(true);
    axios.get(PARKS_ENDPOINT)
      .then((res) => {
        setParks(res.data.Parks || []);
        setLoading(false);

      })
      .catch(() => {
        setError('There was a problem retrieving the parks data.');
        setLoading(false);
      });
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Reset to all parks
      setLoading(true);
      axios.get(PARKS_ENDPOINT)
        .then((res) => {
          setParks(res.data.Parks || []);
          setLoading(false);
          setIsSearching(false);
        })
        .catch(() => {
          setError('There was a problem retrieving the parks data.');
          setLoading(false);
        });
      return;
    }

    setLoading(true);
    setIsSearching(true);
    axios.get(`${SEARCH_ENDPOINT}?name=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        setParks(res.data.Parks || []);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem searching parks.');
        setLoading(false);
      });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setLoading(true);
    axios.get(PARKS_ENDPOINT)
      .then((res) => {
        setParks(res.data.Parks || []);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the parks data.');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="parks-wrapper">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parks-wrapper">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="parks-wrapper">
      <header className="parks-header">
        <h1>National Parks</h1>
        <p className="parks-subtitle">Explore America&apos;s natural treasures</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search parks by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
          {isSearching && (
            <button type="button" className="clear-btn" onClick={clearSearch}>
              Clear
            </button>
          )}
        </form>

        {isSearching && (
          <p className="search-results">
            Found {parks.length} park{parks.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
          </p>
        )}
      </header>

      <div className="parks-grid">
        {parks.map((park) => (
          <Link
            key={park.park_code || park._id}
            to={`/countries/US/states/${Array.isArray(park.state_code) ? park.state_code[0] : park.state_code}/parks/${park.park_code}`}
            state={{ from: 'search' }}
            className="park-card-link"
          >
            <div className="park-card">
              {park.images && park.images[0] && (
                <div className="park-image">
                  <img src={park.images[0].url} alt={park.name} />
                </div>
              )}
              <div className="park-content">
                <h2>{park.name}</h2>
                {park.designation && (
                  <span className="park-designation">{park.designation}</span>
                )}
                <div className="park-details">
                  {park.state_code && (
                    <p><strong>State:</strong> {Array.isArray(park.state_code) ? park.state_code.join(', ') : park.state_code}</p>
                  )}
                  {park.description && (
                    <p className="park-description">{park.description.substring(0, 150)}...</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {parks.length === 0 && (
        <p className="no-data">
          {isSearching ? 'No parks found matching your search.' : 'No parks found. Load some data!'}
        </p>
      )}
    </div>
  );
}

export default Parks;
