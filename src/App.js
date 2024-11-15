import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Player from './components/Player';
import StationList from './components/StationList';
import SearchBar from './components/SearchBar';
import SortControls from './components/SortControls';
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

      console.log('Stations fetched:', data?.length);
      
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
    } catch (error) {
      console.error('Error loading stations:', error);
      setError(error.message || 'Failed to load radio stations');
      if (!append) {
        setStations([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadStations(1, false);
  }, [loadStations]);

  const handleStationSelect = useCallback((station) => {
    console.log('Selected station:', station?.name);
    setCurrentStation(station);
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
    setHasMore(true);
    loadStations(1, false);
  }, [loadStations]);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadStations(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, loadStations]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Internet Radio</h1>
        <div className="header-controls">
          <SearchBar onSearch={handleSearch} initialValue={searchTerm} disabled={isLoading} />
          <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
        </div>
      </header>

      <main className="main-content">
        {!isLoading && !error && stations.length > 0 && (
          <div className="stations-count">
            {stations.length} stations loaded
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button onClick={() => loadStations(1, false)} className="button retry-button">
              Retry Loading Stations
            </button>
          </div>
        )}

        {isLoading && page === 1 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading radio stations...</p>
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

        {currentStation && (
          <Player
            station={currentStation}
            onClose={() => setCurrentStation(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
