import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import PropTypes from 'prop-types';
import './USMap.css';
import statesGeo from '../../geodata/states-geo.json';

export default function USMap({ onStateClick, parkCounts }) {
  const [tooltip, setTooltip] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      {tooltip && (
        <div
          className="map-tooltip"
          style={{
            left: position.x + 10,
            top: position.y + 10,
          }}
        >
          {tooltip}
        </div>
      )}
      <ComposableMap projection="geoAlbersUsa" width={800} height={500}>
        <Geographies geography={statesGeo}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = geo.properties.code;
              const name = geo.properties.name;
              return (
                <Geography
                  key={geo.rsmKey}
                  className="geo-state clickable"
                  geography={geo}
                  onClick={() => onStateClick(code)}

                  onMouseEnter={(e) => {
                    const count = parkCounts?.[code] || 0;
                    setTooltip(`${name}: ${count} parks`);
                    setPosition({
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseMove={(e) => {
                    setPosition({
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => {
                    setTooltip('');
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

USMap.propTypes = {
  onStateClick: PropTypes.func.isRequired,
  parkCounts: PropTypes.object
};