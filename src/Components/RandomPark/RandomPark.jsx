import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { BACKEND_URL } from '../../constants';
import './RandomPark.css';

function RandomPark() {
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');

  const fetchRandomPark = async () => {
    setLoading(true);
    setRevealed(false);
    setPark(null);
    setError('');

    try {
      const res = await axios.get(`${BACKEND_URL}/parks/random`);
      const parkData = res.data.park;
      
      // Suspense delay for the claw machine effect
      setTimeout(() => {
        setPark(parkData);
        setLoading(false);
        setTimeout(() => setRevealed(true), 100);
      }, 2000);
    } catch {
      setError('Failed to grab a park. Try again!');
      setLoading(false);
    }
  };

  const stateCode = park?.state_code;
  const firstState = Array.isArray(stateCode) ? stateCode[0] : stateCode;

  return (
    <div className="random-park-wrapper">
      <div className="claw-machine">
        <h1 className="machine-title">Park Picker</h1>
        <p className="machine-subtitle">Feeling lucky? Let fate choose your next adventure!</p>

        <div className="machine-window">
          {!loading && !park && (
            <div className="empty-state">
              <span className="claw-icon">🎰</span>
              <p>Press the button to discover a random park</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="claw-animation">
                <span className="claw">🪝</span>
              </div>
              <p className="grabbing-text">Grabbing a park...</p>
            </div>
          )}

          {park && !loading && (
            <div className={`park-reveal ${revealed ? 'revealed' : ''}`}>
              {park.images?.[0] && (
                <div className="reveal-image">
                  <img src={park.images[0].url} alt={park.name} />
                </div>
              )}
              <div className="reveal-content">
                <h2>{park.name}</h2>
                {park.designation && (
                  <span className="park-badge">{park.designation}</span>
                )}
                {park.state_code && (
                  <p className="park-location">
                    📍 {Array.isArray(park.state_code) ? park.state_code.join(', ') : park.state_code}
                  </p>
                )}
                {park.description && (
                  <p className="park-desc">{park.description.substring(0, 200)}...</p>
                )}
                <Link
                  to={`/countries/US/states/${firstState}/parks/${park.park_code}`}
                  className="explore-btn"
                >
                  Explore This Park →
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}
        </div>

        <button
          className={`pull-lever ${loading ? 'pulling' : ''}`}
          onClick={fetchRandomPark}
          disabled={loading}
        >
          {loading ? 'Grabbing...' : park ? 'Try Again!' : 'Pull the Lever!'}
        </button>
      </div>
    </div>
  );
}

export default RandomPark;
