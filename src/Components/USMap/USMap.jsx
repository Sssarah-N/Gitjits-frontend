import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import PropTypes from 'prop-types';
import './USMap.css';
import statesGeo from './states-geo.json';

export default function USMap({ onStateClick }) {
  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <ComposableMap projection="geoAlbersUsa" width={800} height={500}>
        <Geographies geography={statesGeo}>
          {({ geographies }) =>
            geographies.map((geo) => {
              return (
                <Geography
                  key={geo.rsmKey}
                  className="geo-state"
                  geography={geo}
                  onClick={() => onStateClick(geo.properties.code)}
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
};