import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Player from './components/Player';
import StationList from './components/StationList';
import SearchBar from './components/SearchBar';
import SortControls from './components/SortControls';
import GlobeView from './components/GlobeView';
import { radioAPI } from './services/radioAPI';

function App() {
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showGlobe, setShowGlobe] = useState(false);
  const ITEMS_PER_PAGE = 50;

  const loadStations = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      console.log(`Fetching stations page ${pageNum} (offset: ${offset})...`);
      
      let data;
      if (searchTerm) {
        data = await radioAPI.getStationsByName(searchTerm, ITEMS_PER_PAGE, offset);
      } else {
        data = await radioAPI.getTopStations(ITEMS_PER_PAGE, offset);
      }

      if (!data || data.length === 0) {
        setHasMore(false);
        if (pageNum === 1) {
          throw new Error('No stations available');
        }
        return;
      }

      setStations(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading stations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm, ITEMS_PER_PAGE]);

  useEffect(() => {
    loadStations(1, false);
  }, [loadStations]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
    loadStations(1, false);
  }, [loadStations]);

  const handleStationSelect = useCallback((station) => {
    console.log('Selected station:', station);
    setCurrentStation(station);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadStations(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, loadStations]);

  const handleCountrySelect = async (countryCode) => {
    setSearchTerm('');
    setShowGlobe(false);
    setPage(1);
    try {
      setIsLoading(true);
      setError(null);
      const data = await radioAPI.getStationsByCountry(countryCode, ITEMS_PER_PAGE, 0);
      setStations(data);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      setError('Failed to load stations for selected country');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Internet Radio Browser</h1>
        <div className="controls">
          <SearchBar onSearch={handleSearch} />
          <button 
            className="globe-button"
            onClick={() => setShowGlobe(true)}
            title="Browse stations by country"
          >
            🌍
          </button>
          <SortControls onSort={setSortBy} />
        </div>
        <div className="stations-count">
          {stations.length} stations found
        </div>
      </header>

      {showGlobe && (
        <>
          <div className="globe-overlay" onClick={() => setShowGlobe(false)} />
          <div className="globe-container">
            <button className="close-globe" onClick={() => setShowGlobe(false)}>×</button>
            <GlobeView 
              stations={stations} 
              onCountrySelect={handleCountrySelect}
            />
          </div>
        </>
      )}

      <main className="main-content">
        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button onClick={() => loadStations(1, false)} className="retry-button">
              Retry Loading Stations
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading radio stations...</p>
          </div>
        ) : (
          <StationList
            stations={stations}
            onStationSelect={handleStationSelect}
            currentStation={currentStation}
            sortBy={sortBy}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </main>

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
