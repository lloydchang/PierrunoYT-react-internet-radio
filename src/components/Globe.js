import React, { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';

const Globe3D = ({ stations, onStationSelect }) => {
  const globeEl = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Process stations into coordinates
  useEffect(() => {
    if (!stations) return;

    const validStations = stations.filter(station => 
      station.geo_lat && station.geo_long && 
      !isNaN(parseFloat(station.geo_lat)) && 
      !isNaN(parseFloat(station.geo_long)) &&
      parseFloat(station.geo_lat) >= -90 && 
      parseFloat(station.geo_lat) <= 90 &&
      parseFloat(station.geo_long) >= -180 && 
      parseFloat(station.geo_long) <= 180
    );

    const coords = validStations.map(station => ({
      lat: parseFloat(station.geo_lat),
      lng: parseFloat(station.geo_long),
      altitude: 0.01,
      radius: hoveredPoint?.station?.id === station.id ? 1 : 0.5,
      color: hoveredPoint?.station?.id === station.id ? '#ff4081' : '#2196f3',
      station: station,
      name: station.name,
      country: station.country
    }));

    setCoordinates(coords);
  }, [stations, hoveredPoint]);

  // Initialize globe
  useEffect(() => {
    if (!globeEl.current || initialized) return;

    // Initial position
    globeEl.current.pointOfView({ 
      lat: 20, 
      lng: 0, 
      altitude: 2.5 
    });

    // Enable auto-rotation
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.5;
    globeEl.current.controls().enableZoom = true;
    globeEl.current.controls().enablePan = false;
    globeEl.current.controls().minDistance = 200;
    globeEl.current.controls().maxDistance = 500;

    setInitialized(true);
  }, [initialized]);

  const handlePointHover = useCallback((point) => {
    setHoveredPoint(point);
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = !point;
    }
  }, []);

  const handlePointClick = useCallback((point) => {
    if (point?.station) {
      onStationSelect(point.station);
    }
  }, [onStationSelect]);

  const getLabelContent = useCallback((point) => {
    if (!point) return '';
    return `
      <div style="
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
      ">
        ${point.name}
        ${point.country ? ` - ${point.country}` : ''}
      </div>
    `;
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', background: '#1a1a1a' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={coordinates}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="altitude"
        pointRadius="radius"
        pointColor="color"
        pointsMerge={false}
        pointsTransitionDuration={200}
        onPointHover={handlePointHover}
        onPointClick={handlePointClick}
        labelLat="lat"
        labelLng="lng"
        labelAltitude={0.01}
        labelDotRadius={0.3}
        labelColor={() => 'rgba(255, 255, 255, 0.75)'}
        labelText={hoveredPoint ? getLabelContent(hoveredPoint) : ''}
        labelSize={1}
        labelResolution={2}
        atmosphereColor="#2196f3"
        atmosphereAltitude={0.1}
      />
    </div>
  );
};

export default Globe3D;
