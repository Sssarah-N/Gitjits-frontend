import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './ParksSearch.css';

const PARKS_ENDPOINT = `${BACKEND_URL}/parks`;
const PARKS_PER_PAGE = 12;
const VALID_MODES = ['name', 'state', 'type', 'activity', 'topic'];

function Parks() {
  const [error, setError] = useState('');
  const [parks, setParks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [topics, setTopics] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const rawMode = searchParams.get('mode') || 'name';
  const searchMode = VALID_MODES.includes(rawMode) ? rawMode : 'name';
  const searchQuery = searchParams.get('q') || '';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const prevFilterKeyRef = useRef(null);

  useEffect(() => {
    if (!VALID_MODES.includes(rawMode)) {
      const p = new URLSearchParams(searchParams);
      p.set('mode', 'name');
      setSearchParams(p, { replace: true });
    }
  }, [rawMode, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchMode === 'activity' || searchMode === 'topic') {
      setDebouncedSearchQuery(searchQuery);
      return undefined;
    }
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchMode]);

  const setSearchQuery = (value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set('q', value);
    else p.delete('q');
    p.set('mode', searchMode);
    p.delete('page');
    setSearchParams(p);
  };

  const setSearchMode = (mode) => {
    const p = new URLSearchParams(searchParams);
    p.set('mode', mode);
    p.delete('q');
    p.delete('page');
    setSearchParams(p);
  };

  const setPage = (page) => {
    const p = new URLSearchParams(searchParams);
    if (page <= 1) p.delete('page');
    else p.set('page', String(page));
    setSearchParams(p);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      axios.get(`${PARKS_ENDPOINT}/activities`),
      axios.get(`${PARKS_ENDPOINT}/topics`),
    ])
      .then(([actRes, topRes]) => {
        if (!cancelled) {
          setActivities(actRes.data.activities || []);
          setTopics(topRes.data.topics || []);
        }
      })
      .catch(() => {
        if (!cancelled) console.error('Failed to load activities or topics');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setError('');

    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('per_page', String(PARKS_PER_PAGE));

    if (searchMode === 'name' && debouncedSearchQuery.trim()) {
      params.set('name', debouncedSearchQuery.trim());
    } else if (searchMode === 'state' && debouncedSearchQuery.trim()) {
      params.set('state', debouncedSearchQuery.trim());
    } else if (searchMode === 'type' && debouncedSearchQuery.trim()) {
      params.set('designation', debouncedSearchQuery.trim());
    } else if (searchMode === 'activity' && searchQuery) {
      params.set('activity', searchQuery);
    } else if (searchMode === 'topic' && searchQuery) {
      params.set('topic', searchQuery);
    }

    axios.get(`${PARKS_ENDPOINT}/filter?${params.toString()}`)
      .then((res) => {
        if (!cancelled) {
          setParks(res.data.Parks || []);
          setTotalCount(res.data.total ?? res.data.count ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('There was a problem retrieving the parks data.');
          setParks([]);
          setTotalCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => { cancelled = true; };
  }, [searchMode, debouncedSearchQuery, searchQuery, currentPage]);

  const filterKey = `${searchMode}|${
    searchMode === 'activity' || searchMode === 'topic'
      ? searchQuery
      : debouncedSearchQuery
  }`;

  useEffect(() => {
    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterKey;
      return;
    }
    if (prevFilterKeyRef.current === filterKey) return;
    prevFilterKeyRef.current = filterKey;
    const p = new URLSearchParams(searchParams);
    if (p.has('page')) {
      p.delete('page');
      setSearchParams(p, { replace: true });
    }
  }, [filterKey, searchParams, setSearchParams]);

  const totalPages = Math.ceil(totalCount / PARKS_PER_PAGE) || 1;

  useEffect(() => {
    if (listLoading) return;
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [listLoading, totalCount, currentPage, totalPages]);

  const isSearching = searchMode === 'activity' || searchMode === 'topic'
    ? searchQuery.length > 0
    : searchQuery.trim().length > 0;

  const goToPage = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (error && !listLoading && parks.length === 0 && totalCount === 0) {
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
            onChange={(e) => { setSearchMode(e.target.value); }}
            className="search-select"
          >
            <option value="name">Search by Name</option>
            <option value="state">Search by State</option>
            <option value="type">Search by Type</option>
            <option value="activity">Search by Activity</option>
            <option value="topic">Search by Topic</option>
          </select>
          {searchMode === 'activity' ? (
            <select
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-select"
            >
              <option value="">Select an activity...</option>
              {activities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          ) : searchMode === 'topic' ? (
            <select
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-select"
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={
                searchMode === 'name' ? 'Search parks by name...' :
                  searchMode === 'state' ? 'Search by state code...' :
                    'Search by park type...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          )}
          <button type="submit" className="search-btn" onClick={(e) => e.preventDefault()}>
            Search
          </button>
          {isSearching && (
            <button type="button" className="clear-btn" onClick={() => { setSearchQuery(''); }}>
              Clear
            </button>
          )}
        </form>

        {!isSearching && searchMode !== 'name' && searchMode !== 'activity' && searchMode !== 'topic' && (
          <div className="search-hints">
            <span className="hints-label">Try:</span>
            {searchMode === 'type' && (
              <>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('National Park')}>National Park</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('National Monument')}>National Monument</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('National Historic Site')}>National Historic Site</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('National Seashore')}>National Seashore</button>
              </>
            )}
            {searchMode === 'state' && (
              <>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('CA')}>CA</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('TX')}>TX</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('NY')}>NY</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('FL')}>FL</button>
                <button type="button" className="hint-chip" onClick={() => setSearchQuery('AZ')}>AZ</button>
              </>
            )}
          </div>
        )}

        {isSearching && !listLoading && (
          <p className="search-results">
            Found {totalCount} park{totalCount !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
          </p>
        )}
      </header>

      {listLoading && (
        <p className="parks-loading-inline">Loading parks…</p>
      )}

      <div className={`parks-grid ${listLoading ? 'parks-grid-loading' : ''}`}>
        {parks.map((park) => (
          <Link
            key={park.park_code || park._id}
            to={`/countries/${park.country_code || 'US'}/states/${Array.isArray(park.state_code) ? park.state_code[0] : park.state_code}/parks/${park.park_code}`}
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
            disabled={currentPage === 1 || listLoading}
          >
            First
          </button>
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || listLoading}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || listLoading}
          >
            Next
          </button>
          <button
            className="pagination-btn"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages || listLoading}
          >
            Last
          </button>
        </div>
      )}

      {!listLoading && parks.length === 0 && (
        <p className="no-data">
          {isSearching ? 'No parks found matching your search.' : 'No parks found. Load some data!'}
        </p>
      )}
    </div>
  );
}

export default Parks;
