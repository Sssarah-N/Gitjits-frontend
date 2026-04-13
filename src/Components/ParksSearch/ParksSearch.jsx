import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './ParksSearch.css';

const PARKS_ENDPOINT = `${BACKEND_URL}/parks`;
const PARKS_PER_PAGE = 12;

function Parks() {
  const [error, setError] = useState('');
  const [allParks, setAllParks] = useState([]);
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (value) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [searchMode, setSearchMode] = useState('name');

  // Load all parks once on mount
  useEffect(() => {
    axios.get(PARKS_ENDPOINT)
      .then((res) => {
        const data = res.data.Parks || [];
        setAllParks(data);
        setParks(data);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the parks data.');
        setLoading(false);
      });
  }, []);

  // Filter as user types and reset page
  useEffect(() => {
    setCurrentPage(1);
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      setParks(allParks);
    } else if (searchMode === 'name') {
      setParks(allParks.filter(park => {
        const name = park.name?.toLowerCase() || '';
        const fullName = park.full_name?.toLowerCase() || '';
        return name.startsWith(q) || fullName.startsWith(q) ||
          name.split(' ').some(word => word.startsWith(q)) ||
          fullName.split(' ').some(word => word.startsWith(q));
      }));
    } else if (searchMode === 'type') {
      setParks(allParks.filter(park =>
        park.designation?.toLowerCase().includes(q)
      ));
    } else if (searchMode === 'activity') {
      setParks(allParks.filter(park =>
        park.activities?.some(a => a.toLowerCase().includes(q))
      ));
    }
  }, [searchQuery, searchMode, allParks]);

  const isSearching = searchQuery.trim().length > 0;

  // Pagination calculations
  const totalPages = Math.ceil(parks.length / PARKS_PER_PAGE);
  const startIndex = (currentPage - 1) * PARKS_PER_PAGE;
  const currentParks = parks.slice(startIndex, startIndex + PARKS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        <form className="search-form">
          <select
            value={searchMode}
            onChange={(e) => { setSearchMode(e.target.value); setSearchQuery(''); }}
            className="search-select"
          >
            <option value="name">Search by Name</option>
            <option value="type">Search by Type</option>
            <option value="activity">Search by Activity</option>
          </select>
          <input
            type="text"
            placeholder={
              searchMode === 'name' ? 'Search parks by name...' :
              searchMode === 'type' ? 'Search by park type...' :
              'Search by activity...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" onClick={(e) => e.preventDefault()}>
            Search
          </button>
          {isSearching && (
            <button type="button" className="clear-btn" onClick={() => { setSearchQuery(''); }}>
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
        {currentParks.map((park) => (
          <Link
            key={park.park_code || park._id}
            to={`/countries/US/states/${Array.isArray(park.state_code) ? park.state_code[0] : park.state_code}/parks/${park.park_code}`}
            state={{ from: 'search' }}
            className="park-card-link"
          >
            <div className="park-card">
              {park.images && park.images[0] && (
                <div className="park-image">
                  <img
                    src={park.images[0].url}
                    alt={park.name}
                    loading="lazy"
                    decoding="async"
                  />
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button
            className="pagination-btn"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      )}

      {parks.length === 0 && (
        <p className="no-data">
          {isSearching ? 'No parks found matching your search.' : 'No parks found. Load some data!'}
        </p>
      )}
    </div>
  );
}

export default Parks;