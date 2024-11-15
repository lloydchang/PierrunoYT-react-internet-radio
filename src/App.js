import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Player from './components/Player';
import StationList from './components/StationList';
import SearchBar from './components/SearchBar';
import { fetchStations, searchStations } from './services/radioAPI';

function App() {
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const loadStations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching stations...');
      const data = await fetchStations();
      console.log('Stations fetched:', data?.length);
      if (!data || data.length === 0) {
        throw new Error('No stations available');
      }
      setStations(data);
      setFilteredStations(data);
    } catch (error) {
      console.error('Error loading stations:', error);
      setError(error.message || 'Failed to load radio stations');
      // Clear stations on error to prevent showing stale data
      setStations([]);
      setFilteredStations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations, retryCount]);

  const handleStationSelect = useCallback((station) => {
    console.log('Selected station:', station?.name);
    setCurrentStation(station);
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    setIsLoading(true);
    setError(null);

    try {
      if (!term.trim()) {
        console.log('Showing all stations');
        setFilteredStations(stations);
      } else {
        console.log('Searching for:', term);
        const searchResults = await searchStations(term);
        if (!searchResults || searchResults.length === 0) {
          console.log('No results found');
          setFilteredStations([]);
        } else {
          console.log('Search results:', searchResults.length);
          setFilteredStations(searchResults);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Error searching stations');
      setFilteredStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('Retrying...');
    setRetryCount(count => count + 1);
  };

  const handleShowAll = () => {
    console.log('Showing all stations');
    setSearchTerm('');
    setFilteredStations(stations);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Internet Radio</h1>
      </header>

      <main>
        <SearchBar 
          onSearch={handleSearch} 
          initialValue={searchTerm}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading radio stations...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={handleRetry} className="retry-button">
              🔄 Retry Loading Stations
            </button>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="no-results">
            <p>No radio stations found{searchTerm ? ` for "${searchTerm}"` : ''}</p>
            {searchTerm && stations.length > 0 && (
              <button onClick={handleShowAll} className="show-all-button">
                Show All Stations
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="stations-count">
              Showing {filteredStations.length} stations
              {searchTerm && ` for "${searchTerm}"`}
            </div>
            <StationList 
              stations={filteredStations} 
              onStationSelect={handleStationSelect}
              currentStation={currentStation}
            />
          </>
        )}

        {currentStation && <Player station={currentStation} />}
      </main>
    </div>
  );
}

export default App;
