import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

import { BACKEND_URL } from '../../constants';
import statesGeo from '../../geodata/states-geo.json';
import './RandomPark.css';

const STATE_CENTERS = {
  AL: [-86.9, 32.8], AK: [-153.5, 64.2], AZ: [-111.1, 34.0], AR: [-92.2, 35.0],
  CA: [-119.4, 36.8], CO: [-105.3, 39.1], CT: [-72.8, 41.6], DE: [-75.5, 39.0],
  FL: [-81.5, 27.6], GA: [-82.9, 32.2], HI: [-155.6, 19.9], ID: [-114.5, 44.2],
  IL: [-89.4, 40.6], IN: [-86.1, 40.3], IA: [-93.1, 42.0], KS: [-98.5, 38.5],
  KY: [-84.3, 37.7], LA: [-92.1, 31.2], ME: [-69.4, 45.3], MD: [-76.6, 39.0],
  MA: [-71.5, 42.4], MI: [-84.5, 43.3], MN: [-94.6, 46.4], MS: [-89.4, 32.7],
  MO: [-91.8, 38.5], MT: [-110.4, 46.9], NE: [-99.9, 41.5], NV: [-116.4, 38.8],
  NH: [-71.6, 43.2], NJ: [-74.4, 40.1], NM: [-105.9, 34.5], NY: [-75.5, 43.0],
  NC: [-79.0, 35.8], ND: [-101.0, 47.5], OH: [-82.9, 40.4], OK: [-97.5, 35.0],
  OR: [-120.6, 43.8], PA: [-77.2, 41.2], RI: [-71.5, 41.7], SC: [-81.1, 34.0],
  SD: [-100.0, 43.9], TN: [-86.6, 35.5], TX: [-100.0, 31.0], UT: [-111.1, 39.3],
  VT: [-72.6, 44.6], VA: [-79.5, 37.4], WA: [-120.7, 47.7], WV: [-80.5, 38.6],
  WI: [-89.6, 43.8], WY: [-107.3, 43.1], DC: [-77.0, 38.9]
};

function RandomPark() {
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [targetState, setTargetState] = useState(null);
  const [dartPosition, setDartPosition] = useState(null);
  const [dartLanded, setDartLanded] = useState(false);

  const fetchRandomPark = async () => {
    setLoading(true);
    setRevealed(false);
    setPark(null);
    setError('');
    setTargetState(null);
    setDartPosition(null);
    setDartLanded(false);

    try {
      const res = await axios.get(`${BACKEND_URL}/parks/random`);
      const parkData = res.data.park;
      const stateCode = Array.isArray(parkData.state_code) ? parkData.state_code[0] : parkData.state_code;
      
      // Start dart animation
      setDartPosition([-98, 39]); // Center of US
      
      setTimeout(() => {
        // Move dart to target state
        const targetCoords = STATE_CENTERS[stateCode] || [-98, 39];
        setDartPosition(targetCoords);
        setTargetState(stateCode);
        
        setTimeout(() => {
          setDartLanded(true);
          setTimeout(() => {
            setPark(parkData);
            setLoading(false);
            setTimeout(() => setRevealed(true), 100);
          }, 500);
        }, 800);
      }, 500);
    } catch {
      setError('Failed to grab a park. Try again!');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      setDartPosition(null);
      setDartLanded(false);
    }
  }, [loading]);

  const stateCode = park?.state_code;
  const firstState = Array.isArray(stateCode) ? stateCode[0] : stateCode;

  return (
    <div className="random-park-wrapper">
      <div className="claw-machine">
        <h1 className="machine-title">Dart Park</h1>
        <p className="machine-subtitle">Throw a dart at the map and discover a random park!</p>

        <div className="machine-window">
          {!loading && !park && (
            <div className="empty-state">
              <div className="preview-map">
                <ComposableMap
                  projection="geoAlbersUsa"
                  width={805}
                  height={500}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Geographies geography={statesGeo}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#e8f5e9"
                          stroke="#a5d6a7"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  <Marker coordinates={[-98, 39]}>
                    <g className="waiting-dart">
                      <circle r={8} fill="#4CAF50" />
                      <circle r={4} fill="#fff" />
                      <circle r={2} fill="#4CAF50" />
                    </g>
                  </Marker>
                </ComposableMap>
              </div>
              <p>Press the button to throw a dart!</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="dart-map">
                <ComposableMap
                  projection="geoAlbersUsa"
                  width={805}
                  height={450}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Geographies geography={statesGeo}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const code = geo.properties.code;
                        const isTarget = code === targetState;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={isTarget ? '#4CAF50' : '#e8f5e9'}
                            stroke="#a5d6a7"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: 'none' },
                              hover: { outline: 'none' },
                              pressed: { outline: 'none' },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {dartPosition && (
                    <Marker coordinates={dartPosition}>
                      <g className={`dart-marker ${dartLanded ? 'landed' : ''}`}>
                        <path
                          d="M0,-24 C-4,-24 -8,-20 -8,-14 C-8,-6 0,0 0,0 C0,0 8,-6 8,-14 C8,-20 4,-24 0,-24 Z"
                          fill="#d32f2f"
                          stroke="#b71c1c"
                          strokeWidth={1}
                        />
                        <circle cx={0} cy={-14} r={3} fill="#fff" />
                      </g>
                    </Marker>
                  )}
                </ComposableMap>
              </div>
              <p className="grabbing-text">
                {dartLanded ? `Found a park in ${targetState}!` : 'Throwing dart...'}
              </p>
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
                  to={`/countries/${park.country_code || 'USA'}/states/${firstState}/parks/${park.park_code}`}
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
          {loading ? 'Throwing...' : park ? 'Throw Again!' : 'Throw the Dart!'}
        </button>
      </div>
    </div>
  );
}

export default RandomPark;
