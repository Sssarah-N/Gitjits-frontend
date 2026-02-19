import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import { BACKEND_URL } from '../../constants';
import './StateDetail.css';

function StateDetail() {
  const { countryCode, stateCode } = useParams();
  const [error, setError] = useState('');
  const [state, setState] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      axios.get(`${BACKEND_URL}/countries/${countryCode}/states/${stateCode}`),
      axios.get(`${BACKEND_URL}/countries/${countryCode}/states/${stateCode}/cities`)
    ])
      .then(([stateRes, citiesRes]) => {
        setState(stateRes.data.State);
        setCities(citiesRes.data.Cities || []);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the state data.');
        setLoading(false);
      });
  }, [countryCode, stateCode]);

  if (loading) {
    return (
      <div className="state-detail-wrapper">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-detail-wrapper">
        <div className="error-message">{error}</div>
        <Link to={`/countries/${countryCode}`} className="back-link">
          ← Back to Country
        </Link>
      </div>
    );
  }

  return (
    <div className="state-detail-wrapper">
      <Link to={`/countries/${countryCode}`} className="back-link">
        ← Back to {countryCode}
      </Link>
      
      {state && (
        <div className="state-info">
          <h1>{state.name}</h1>
          <div className="state-meta">
            <p><strong>State Code:</strong> {state.state_code}</p>
            <p><strong>Country Code:</strong> {state.country_code}</p>
            {state.capital && <p><strong>Capital:</strong> {state.capital}</p>}
            {state.population && (
              <p><strong>Population:</strong> {state.population.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      <div className="cities-section">
        <h2>Cities</h2>
        
        {cities.length > 0 ? (
          <div className="cities-grid">
            {cities.map((city, index) => (
              <div key={`${city.name}-${index}`} className="city-card">
                <h3>{city.name}</h3>
                <p className="city-code">{city.state_code}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No cities found for this state.</p>
        )}
      </div>
    </div>
  );
}

export default StateDetail;
