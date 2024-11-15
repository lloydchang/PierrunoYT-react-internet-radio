import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Player from './components/Player';
import StationList from './components/StationList';
import SearchBar from './components/SearchBar';
import { radioAPI } from './services/radioAPI';

function App() {
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTopStations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching top stations...');
      const data = await radioAPI.getTopStations(50);
      console.log('Stations fetched:', data?.length);
      if (!data || data.length === 0) {
        throw new Error('No stations available');
      }
      setStations(data);
    } catch (error) {
      console.error('Error loading stations:', error);
      setError(error.message || 'Failed to load radio stations');
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopStations();
  }, [loadTopStations]);

  const handleStationSelect = useCallback((station) => {
    console.log('Selected station:', station?.name);
    setCurrentStation(station);
  }, []);

  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    setIsLoading(true);
    setError(null);

    try {
      if (!term || !term.trim()) {
        await loadTopStations();
      } else {
        console.log('Searching for:', term);
        const searchResults = await radioAPI.getStationsByName(term.trim());
        console.log('Search results:', searchResults?.length);
        
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          setStations(searchResults);
        } else {
          setStations([]);
          setError('No stations found for your search');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Error searching stations');
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadTopStations]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Internet Radio</h1>
        <SearchBar onSearch={handleSearch} initialValue={searchTerm} disabled={isLoading} />
      </header>

      <main className="main-content">
        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button onClick={loadTopStations} className="button retry-button">
              Retry Loading Stations
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading radio stations...</p>
          </div>
        ) : (
          <StationList
            stations={stations}
            isLoading={isLoading}
            onStationSelect={handleStationSelect}
            currentStation={currentStation}
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
