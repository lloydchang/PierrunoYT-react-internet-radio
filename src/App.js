import React, { useState, useEffect, useCallback } from 'react';
import { IoSearchOutline, IoGlobeOutline } from 'react-icons/io5';
import './App.css';
import { radioAPI } from './services/radioAPI';
import Player from './components/Player';
import Globe3D from './components/Globe';

function App() {
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStation, setCurrentStation] = useState(null);
  const [showGlobe, setShowGlobe] = useState(false);

  const loadStations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await radioAPI.getTopStations(100); // Increased limit for better globe visualization
      setStations(data);
    } catch (err) {
      setError('Failed to load radio stations. Please try again.');
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return loadStations();
    }

    try {
      setLoading(true);
      setError(null);
      const data = await radioAPI.searchStations(searchQuery);
      setStations(data);
    } catch (err) {
      setError('Failed to search radio stations. Please try again.');
      console.error('Error searching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = useCallback((station) => {
    console.log('Selected station:', station);
    setCurrentStation(station);
    setShowGlobe(false);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Internet Radio</h1>
        <div className="header-controls">
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search radio stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="search-button"
                disabled={loading}
              >
                <IoSearchOutline />
              </button>
            </form>
          </div>
          <button 
            className="globe-button"
            onClick={() => setShowGlobe(!showGlobe)}
            title={showGlobe ? "Show list view" : "Show globe view"}
          >
            <IoGlobeOutline />
          </button>
        </div>
      </header>

      {error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={loadStations}>
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading stations...</p>
        </div>
      ) : showGlobe ? (
        <div className="globe-container">
          <Globe3D 
            stations={stations}
            onStationSelect={handleStationSelect}
          />
        </div>
      ) : stations.length === 0 ? (
        <div className="no-results">
          <p>No radio stations found.</p>
          <button className="show-all-button" onClick={loadStations}>
            Show All Stations
          </button>
        </div>
      ) : (
        <div className="stations-list">
          {stations.map((station) => (
            <div
              key={station.id || station.stationuuid}
              className={`station-card ${currentStation?.id === station.id ? 'selected' : ''}`}
              onClick={() => handleStationSelect(station)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleStationSelect(station);
                }
              }}
            >
              <div className="station-info">
                {station.favicon && (
                  <img
                    src={station.favicon}
                    alt={station.name}
                    className="station-logo"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="station-details">
                  <h3>{station.name}</h3>
                  <div className="station-meta">
                    {station.tags && (
                      <span className="station-tag">
                        {Array.isArray(station.tags)
                          ? station.tags[0]
                          : station.tags.split(',')[0]}
                      </span>
                    )}
                    {station.countrycode && (
                      <span className="station-country">{station.countrycode}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentStation && (
        <Player
          station={currentStation}
          onClose={() => setCurrentStation(null)}
        />
      )}
    </div>
  );
}

export default App;
