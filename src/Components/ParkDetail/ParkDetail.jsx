import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import { BACKEND_URL } from '../../constants';
import './ParkDetail.css';

function ParkDetail() {
  const { countryCode, stateCode, parkCode } = useParams();
  const [park, setPark] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');

    axios
      .get(`${BACKEND_URL}/parks/${parkCode}`)
      .then((res) => {
        console.log("Backend park response:", res.data);
        setPark(res.data.Park);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the park data.');
        setLoading(false);
      });
  }, [parkCode]);

  if (loading) {
    return (
      <div className="park-detail-wrapper">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="park-detail-wrapper">
        <div className="error-message">{error}</div>
        <Link to={`/countries/${countryCode}/states/${stateCode}`} className="back-link">
          ← Back to {stateCode} Parks
        </Link>
      </div>
    );
  }

  return (
    <div className="park-detail-wrapper">
      <Link to={`/countries/${countryCode}/states/${stateCode}`} className="back-link">
        ← Back to {stateCode} Parks
      </Link>

      <div className="page-header">
        <h1>{park?.name || parkCode}</h1>
        <div className="park-meta">
          {park.state_code && <span className="meta-badge">{park.state_code}</span>}
          {park.country_code && <span className="meta-badge">Country: {park.country_code}</span>}
          {park.type && <span className="meta-badge">Type: {park.type}</span>}
          {park.area && <span className="meta-badge">Area: {park.area}</span>}
        </div>
      </div>

      {park.operating_hours &&
    Object.entries(park.operating_hours).map(([unitName, unit]) => (
      <div key={unitName} className="park-hours">
        <p>{unit.description}</p>
        {unit.standardHours && (
          <ul>
            {Object.entries(unit.standardHours).map(([day, hours]) => (
              <li key={day}>
                <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {hours}
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}

      
    </div>
  );
}

export default ParkDetail;