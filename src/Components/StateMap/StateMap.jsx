import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, ZoomableGroup, Geography, Marker } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import PropTypes from 'prop-types';
import statesGeo from '../../geodata/states-geo.json';
import '../USMap/USMap.css';
import './StateMap.css';

export default function StateMap({ stateCode, parkCoords}) {
  const [tooltip, setTooltip] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const code = stateCode?.toUpperCase();

  const W = 800;
  const H = 500;

  const projection = useMemo(() => {
    const geom = statesGeo.objects.states.geometries.find((g) => g.properties.code === code);
    if (!geom) return geoMercator().translate([W / 2, H / 2]).scale(1);
    const outline = feature(statesGeo, {
      type: 'GeometryCollection',
      geometries: [geom],
    });
    return geoMercator().fitSize([W, H], outline);
  }, [code]);

  return (
    <div className="state-map-container" style={{ position: 'relative' }}>
      {tooltip && (
        <div
          className="park-tooltip"
          style={{
            left: position.x + 10,
            top: position.y + 10,
          }}
        >
          {tooltip}
        </div>
      )}

      <ComposableMap projection={projection} width={W} height={H}>
        <ZoomableGroup center={[0, 0]} zoom={1} minZoom={0.5} maxZoom={8}>
          <Geographies
            geography={statesGeo}
            parseGeographies={(geos) => geos.filter((g) => g.properties.code === code)}
          >
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} className="geo-state" />
              ))
            }
          </Geographies>

          {parkCoords.map(({ latitude, longitude, park_code, park_name }) => (
            <Marker
              key={park_code}
              coordinates={[longitude, latitude]}
              onMouseEnter={(e) => {
                setTooltip(park_name);
                setPosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip('')}
              style={{ cursor: 'pointer' }}
            >
              <circle r={5} className="park-marker" />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

StateMap.propTypes = {
  stateCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  parkCoords: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      park_code: PropTypes.string.isRequired,
      park_name: PropTypes.string.isRequired,
    })
  ).isRequired,
};