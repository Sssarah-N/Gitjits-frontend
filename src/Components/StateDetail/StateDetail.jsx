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
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      axios.get(`${BACKEND_URL}/countries/${countryCode}/states/${stateCode}`),
      axios.get(`${BACKEND_URL}/countries/${countryCode}/states/${stateCode}/cities`),
      axios.get(`${BACKEND_URL}/countries/${countryCode}/states/${stateCode}/parks`).catch(() => ({ data: { Parks: [] } }))
    ])
      .then(([stateRes, citiesRes, parksRes]) => {
        setState(stateRes.data.State);
        setCities(citiesRes.data.Cities || []);
        setParks(parksRes.data.Parks || []);
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
      
      <div className="page-header">
        <h1>{state?.name || stateCode}</h1>
        {state && (
          <div className="state-meta">
            {state.state_code && <span className="meta-badge">{state.state_code}</span>}
            {state.country_code && <span className="meta-badge">Country: {state.country_code}</span>}
            {state.capital && <span className="meta-badge">Capital: {state.capital}</span>}
            {state.population && (
              <span className="meta-badge">Pop: {state.population.toLocaleString()}</span>
            )}
          </div>
        )}
      </div>

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

      <div className="parks-section">
        <h2>Parks</h2>
        
        {parks.length > 0 ? (
          <div className="parks-grid">
            {parks.map((park, index) => (
              <div key={`${park.name}-${index}`} className="park-card">
                <h3>{park.name}</h3>
                {park.state_code && <p className="park-code">{park.state_code}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No parks found for this state.</p>
        )}
      </div>
    </div>
  );
}

export default StateDetail;
