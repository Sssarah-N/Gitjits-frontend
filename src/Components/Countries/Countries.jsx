import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './Countries.css';

const COUNTRIES_ENDPOINT = `${BACKEND_URL}/countries`;
const STATISTICS_ENDPOINT = `${BACKEND_URL}/statistics`;

function Countries() {
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      axios.get(COUNTRIES_ENDPOINT),
      axios.get(STATISTICS_ENDPOINT)
    ])
      .then(([countriesRes, statsRes]) => {
        setCountries(countriesRes.data.Countries || []);
        setStatistics(statsRes.data.Statistics);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="countries-wrapper">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="countries-wrapper">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="countries-wrapper">
      <header className="countries-header">
        <h1>Countries</h1>
        {statistics && (
          <div className="statistics">
            <p>Total Countries: {statistics.total_countries || 0}</p>
            <p>Total States: {statistics.total_states || 0}</p>
            <p>Total Cities: {statistics.total_cities || 0}</p>
            <p>Total Parks: {statistics.total_parks || 0}</p>
          </div>
        )}
      </header>
      
      <div className="countries-grid">
        {countries.map((country) => (
          <Link 
            key={country.code} 
            to={`/countries/${country.code}`}
            className="country-card-link"
          >
            <div className="country-card">
              <h2>{country.name}</h2>
              <div className="country-details">
                <p><strong>Code:</strong> {country.code}</p>
                {country.capital && <p><strong>Capital:</strong> {country.capital}</p>}
                {country.continent && <p><strong>Continent:</strong> {country.continent}</p>}
                {country.population && (
                  <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {countries.length === 0 && (
        <p className="no-data">No countries found. Add some data to your API!</p>
      )}
    </div>
  );
}

export default Countries;
