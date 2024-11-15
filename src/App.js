import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Player from './components/Player';
import StationList from './components/StationList';
import SearchBar from './components/SearchBar';
import { fetchStations, searchStations } from './services/shoutcastAPI';

function App() {
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' or 'country'

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

  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    setIsLoading(true);
    setError(null);

    try {
      if (!term || !term.trim()) {
        console.log('Showing all stations');
        setFilteredStations(stations);
      } else {
        console.log('Searching for:', term);
        const searchResults = await searchStations(term.trim());
        console.log('Search results:', searchResults?.length);
        
        // If we have search results and they're more than just a few stations
        if (Array.isArray(searchResults) && searchResults.length > 10) {
          setFilteredStations(searchResults);
        } else {
          // Try fallback search in existing stations
          const localResults = stations.filter(station => 
            station.name.toLowerCase().includes(term.toLowerCase()) ||
            (station.tags && station.tags.toLowerCase().includes(term.toLowerCase())) ||
            (station.country && station.country.toLowerCase().includes(term.toLowerCase()))
          );
          
          if (localResults.length > 0) {
            console.log('Found local results:', localResults.length);
            setFilteredStations(localResults);
          } else {
            console.log('No results found');
            setFilteredStations([]);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Error searching stations');
      setFilteredStations([]);
    } finally {
      setIsLoading(false);
    }
  }, [stations]);

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
    <div className="app-container">
      <header className="app-header">
        <h1>Internet Radio</h1>
        <button onClick={handleShowAll} className="show-all-button">
          Show All Stations
        </button>
      </header>

      <main className="main-content">
        <SearchBar 
          onSearch={handleSearch} 
          initialValue={searchTerm}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading radio stations...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button onClick={handleRetry} className="button retry-button">
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
            <div className="stations-header">
              <div className="stations-count">
                Showing {filteredStations.length} stations
                {searchTerm && ` for "${searchTerm}"`}
              </div>
              <div className="sort-controls">
                <label>
                  Sort by:
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="country">Country</option>
                  </select>
                </label>
              </div>
            </div>
            <StationList 
              stations={filteredStations} 
              onStationSelect={handleStationSelect}
              currentStation={currentStation}
              sortBy={sortBy}
            />
          </>
        )}

        {currentStation && <Player station={currentStation} />}
      </main>
    </div>
  );
}

export default App;
