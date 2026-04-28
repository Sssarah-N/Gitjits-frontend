import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import statesGeo from '../../geodata/states-geo.json';
import './SavedParksMap.css';

export default function SavedParksMap({ parks }) {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const parkCoords = parks.filter(
    (p) => p.latitude && p.longitude
  ).map((p) => ({
    latitude: parseFloat(p.latitude),
    longitude: parseFloat(p.longitude),
    park_code: p.park_code,
    park_name: p.name,
    state_code: Array.isArray(p.state_code) ? p.state_code[0] : p.state_code,
    country_code: p.country_code || 'USA',
  }));

  return (
    <div className="saved-parks-map-container">
      <h3 className="saved-parks-map-title">Your Saved Parks Map</h3>
      <div className="saved-parks-map-wrapper" style={{ position: 'relative' }}>
        {tooltip && (
          <div
            className="park-tooltip"
            style={{ left: position.x + 10, top: position.y + 10 }}
          >
            {tooltip}
          </div>
        )}
        <ComposableMap projection="geoAlbersUsa" width={800} height={500}>
          <ZoomableGroup zoom={1} minZoom={0.5} maxZoom={12} onMove={(e) => setZoomLevel(e.zoom)}>
            <Geographies geography={statesGeo}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="geo-state"
                  />
                ))
              }
            </Geographies>

            {parkCoords.map(({ latitude, longitude, park_code, park_name, state_code, country_code }) => (
              <Marker
                key={park_code}
                coordinates={[longitude, latitude]}
                onClick={() =>
                  navigate(`/countries/${country_code}/states/${state_code}/parks/${park_code}`)
                }
                onMouseEnter={(e) => {
                  setTooltip(park_name);
                  setPosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip('')}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  className="park-marker"
                  r={6 / zoomLevel}
                  strokeWidth={1.5 / zoomLevel}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}

SavedParksMap.propTypes = {
  parks: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      park_code: PropTypes.string.isRequired,
      name: PropTypes.string,
      state_code: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      country_code: PropTypes.string,
    })
  ).isRequired,
};
