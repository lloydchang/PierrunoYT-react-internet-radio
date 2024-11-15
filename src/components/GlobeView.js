import React, { useState, useEffect, useCallback, useRef } from 'react';
import Globe from 'react-globe.gl';
import { scaleLinear } from 'd3-scale';

const countryCoordinates = {
  'US': { lat: 37.0902, lng: -95.7129 },
  'GB': { lat: 55.3781, lng: -3.4360 },
  'DE': { lat: 51.1657, lng: 10.4515 },
  'FR': { lat: 46.2276, lng: 2.2137 },
  'ES': { lat: 40.4637, lng: -3.7492 },
  'IT': { lat: 41.8719, lng: 12.5674 },
  'BR': { lat: -14.2350, lng: -51.9253 },
  'RU': { lat: 61.5240, lng: 105.3188 },
  'CN': { lat: 35.8617, lng: 104.1954 },
  'JP': { lat: 36.2048, lng: 138.2529 },
  'IN': { lat: 20.5937, lng: 78.9629 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'AU': { lat: -25.2744, lng: 133.7751 },
};

function GlobeView({ onCountrySelect, stations }) {
  const globeEl = useRef();
  const [countries, setCountries] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Process stations data to get country statistics
  const processStations = useCallback(() => {
    const countryStats = {};
    stations.forEach(station => {
      if (station.countrycode) {
        const code = station.countrycode.toUpperCase();
        if (!countryStats[code]) {
          countryStats[code] = {
            code,
            count: 0,
            name: station.country || code,
            coordinates: countryCoordinates[code] || { 
              lat: parseFloat(station.geo_lat) || 0, 
              lng: parseFloat(station.geo_long) || 0 
            }
          };
        }
        countryStats[code].count++;
      }
    });

    return Object.values(countryStats);
  }, [stations]);

  useEffect(() => {
    setCountries(processStations());
  }, [stations, processStations]);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      
      // Set initial camera position
      globeEl.current.pointOfView({
        lat: 25,
        lng: 0,
        altitude: 2.5
      });
    }
  }, []);

  const maxStations = Math.max(...countries.map(c => c.count), 1);
  const radiusScale = scaleLinear()
    .domain([0, maxStations])
    .range([0.5, 3]);

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={countries}
        pointLat={d => d.coordinates.lat}
        pointLng={d => d.coordinates.lng}
        pointRadius={d => radiusScale(d.count)}
        pointColor={() => '#ff4b4b'}
        pointAltitude={0.1}
        pointLabel={d => `
          <div class="globe-tooltip">
            <strong>${d.name}</strong><br/>
            ${d.count} stations
          </div>
        `}
        onPointClick={point => {
          onCountrySelect(point.code);
        }}
        onPointHover={setHoveredCountry}
        width={800}
        height={600}
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.1}
      />
      {hoveredCountry && (
        <div className="country-info">
          <h3>{hoveredCountry.name}</h3>
          <p>{hoveredCountry.count} radio stations</p>
        </div>
      )}
    </div>
  );
}

export default GlobeView;
