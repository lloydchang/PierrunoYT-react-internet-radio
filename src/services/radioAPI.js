import { RadioBrowserApi } from 'radio-browser-api';

const api = new RadioBrowserApi('InternetRadioWebUI/1.0');

// Cache for storing search results
const cache = {
  stations: null,
  timestamp: null,
  searchResults: new Map(),
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

const isCacheValid = () => {
  return cache.stations && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION);
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    throw new Error(`Server error: ${error.response.status}`);
  } else if (error.request) {
    throw new Error('Network error. Please check your connection.');
  } else {
    throw new Error('Unable to load radio stations. Please try again later.');
  }
};

export const fetchStations = async () => {
  try {
    // Return cached results if valid
    if (isCacheValid()) {
      return cache.stations;
    }

    // Let the API choose the best available server
    await api.setupService();

    const stations = await api.searchStations({
      limit: 100,
      hidebroken: true,
      order: 'clickcount',
      reverse: true,
    });

    if (!Array.isArray(stations)) {
      throw new Error('Invalid response from server');
    }

    // Filter out invalid stations
    const validStations = stations.filter(station => 
      station && 
      station.url_resolved && 
      station.name &&
      !station.name.toLowerCase().includes('undefined')
    );

    if (validStations.length === 0) {
      throw new Error('No stations found');
    }

    // Cache the results
    cache.stations = validStations;
    cache.timestamp = Date.now();

    return validStations;
  } catch (error) {
    handleApiError(error);
  }
};

export const searchStations = async (searchTerm) => {
  try {
    // Check cache for this search term
    const cacheKey = searchTerm.toLowerCase();
    const cachedResult = cache.searchResults.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_DURATION)) {
      return cachedResult.data;
    }

    // Ensure we're using an available server
    await api.setupService();

    const stations = await api.searchStations({
      name: searchTerm,
      limit: 100,
      hidebroken: true,
    });

    if (!Array.isArray(stations)) {
      throw new Error('Invalid response from server');
    }

    // Filter and sort stations
    const validStations = stations
      .filter(station => 
        station && 
        station.url_resolved && 
        station.name &&
        !station.name.toLowerCase().includes('undefined')
      )
      .sort((a, b) => {
        // Sort by relevance and popularity
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Exact matches first
        if (nameA === searchLower && nameB !== searchLower) return -1;
        if (nameB === searchLower && nameA !== searchLower) return 1;
        
        // Then by click count
        return (parseInt(b.clickcount) || 0) - (parseInt(a.clickcount) || 0);
      });

    // Cache the search results
    cache.searchResults.set(cacheKey, {
      data: validStations,
      timestamp: Date.now()
    });

    return validStations;
  } catch (error) {
    handleApiError(error);
  }
};

export const reportStationClick = async (stationId) => {
  try {
    if (!stationId) return;
    await api.setupService();
    await api.clickStation(stationId);
  } catch (error) {
    console.error('Error reporting station click:', error);
    // Don't throw error for click reporting
  }
};
