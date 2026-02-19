import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import { BACKEND_URL } from '../../constants';
import './CountryDetail.css';

function CountryDetail() {
  const { code } = useParams();
  const [error, setError] = useState('');
  const [country, setCountry] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      axios.get(`${BACKEND_URL}/countries/${code}`),
      axios.get(`${BACKEND_URL}/countries/${code}/states`)
    ])
      .then(([countryRes, statesRes]) => {
        setCountry(countryRes.data.Country);
        setStates(statesRes.data.States || []);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the country data.');
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <div className="country-detail-wrapper">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="country-detail-wrapper">
        <div className="error-message">{error}</div>
        <Link to="/countries" className="back-link">← Back to Countries</Link>
      </div>
    );
  }

  return (
    <div className="country-detail-wrapper">
      <Link to="/countries" className="back-link">← Back to Countries</Link>
      
      <div className="page-header">
        <h1>{country?.name || code}</h1>
        {country && (
          <div className="country-meta">
            {country.code && <span className="meta-badge">{country.code}</span>}
            {country.capital && <span className="meta-badge">Capital: {country.capital}</span>}
            {country.continent && <span className="meta-badge">{country.continent}</span>}
            {country.population && (
              <span className="meta-badge">Pop: {country.population.toLocaleString()}</span>
            )}
          </div>
        )}
      </div>

      <div className="states-section">
        <h2>States / Provinces</h2>
        
        {states.length > 0 ? (
          <div className="states-grid">
            {states.map((state) => (
              <Link
                key={state.state_code}
                to={`/countries/${code}/states/${state.state_code}`}
                className="state-card-link"
              >
                <div className="state-card">
                  <h3>{state.name}</h3>
                  <div className="state-details">
                    <p><strong>Code:</strong> {state.state_code}</p>
                    {state.capital && <p><strong>Capital:</strong> {state.capital}</p>}
                    {state.population && (
                      <p><strong>Population:</strong> {state.population.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="no-data">No states found for this country.</p>
        )}
      </div>
    </div>
  );
}

export default CountryDetail;
