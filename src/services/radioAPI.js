import { RadioBrowserApi } from 'radio-browser-api';

// Initialize the API with a custom user agent
const api = new RadioBrowserApi('InternetRadioWebUI/1.0.0');

// Cache for storing search results
const cache = {
  stations: null,
  timestamp: null,
  searchResults: new Map(),
  errors: new Map()
};

// Cache durations in milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ERROR_CACHE_DURATION = 30 * 1000; // 30 seconds

const isCacheValid = (timestamp) => {
  return timestamp && (Date.now() - timestamp < CACHE_DURATION);
};

const clearExpiredCache = () => {
  const now = Date.now();
  
  // Clear expired search results
  for (const [key, value] of cache.searchResults.entries()) {
    if (now - value.timestamp >= CACHE_DURATION) {
      cache.searchResults.delete(key);
    }
  }

  // Clear expired error cache
  for (const [key, value] of cache.errors.entries()) {
    if (now - value.timestamp >= ERROR_CACHE_DURATION) {
      cache.errors.delete(key);
    }
  }
};

const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    response: error?.response,
    request: error?.request
  });

  if (error?.response?.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  } else if (error?.response) {
    throw new Error(`Server error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`);
  } else if (error?.request) {
    throw new Error('Network error: Unable to reach radio station server. Please check your connection.');
  } else {
    throw new Error(`Error ${context ? `during ${context}` : ''}: ${error.message || 'Unknown error occurred'}`);
  }
};

export const fetchStations = async () => {
  try {
    clearExpiredCache();
    // Return cached results if valid
    if (isCacheValid(cache.timestamp)) {
      console.log('Returning cached stations');
      return cache.stations;
    }

    console.log('Fetching stations...');

    const stations = await api.searchStations({
      limit: 100,
      hidebroken: true,
      order: 'clickcount',
      reverse: true,
    });

    console.log('Raw stations response:', stations);

    if (!Array.isArray(stations)) {
      throw new Error('Invalid response from server: expected array of stations');
    }

    // Filter out invalid stations
    const validStations = stations.filter(station => {
      const isValid = station && 
        station.url_resolved && 
        station.name &&
        !station.name.toLowerCase().includes('undefined');
      
      if (!isValid) {
        console.log('Filtered out invalid station:', station);
      }
      return isValid;
    });

    console.log(`Found ${validStations.length} valid stations`);

    if (validStations.length === 0) {
      throw new Error('No valid stations found in the response');
    }

    // Cache the results
    cache.stations = validStations;
    cache.timestamp = Date.now();

    return validStations;
  } catch (error) {
    // Check if we've had this error recently
    const errorKey = error.message;
    const cachedError = cache.errors.get(errorKey);
    if (cachedError && (Date.now() - cachedError.timestamp < ERROR_CACHE_DURATION)) {
      throw cachedError.error;
    }

    // Cache the error
    const handledError = handleApiError(error, 'station fetch');
    cache.errors.set(errorKey, {
      error: handledError,
      timestamp: Date.now()
    });
    throw handledError;
  }
};

export const searchStations = async (searchTerm) => {
  try {
    clearExpiredCache();
    // Check cache for this search term
    const cacheKey = searchTerm.toLowerCase();
    const cachedResult = cache.searchResults.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_DURATION)) {
      console.log('Returning cached search results for:', searchTerm);
      return cachedResult.data;
    }

    console.log('Searching for stations with term:', searchTerm);

    const stations = await api.searchStations({
      name: searchTerm,
      limit: 100,
      hidebroken: true,
    });

    console.log(`Search returned ${stations?.length || 0} stations`);

    if (!Array.isArray(stations)) {
      throw new Error('Invalid response from server during search');
    }

    // Filter and sort stations
    const validStations = stations
      .filter(station => {
        const isValid = station && 
          station.url_resolved && 
          station.name &&
          !station.name.toLowerCase().includes('undefined');
        
        if (!isValid) {
          console.log('Filtered out invalid search result:', station);
        }
        return isValid;
      })
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

    console.log(`Found ${validStations.length} valid stations for search term:`, searchTerm);

    // Cache the search results
    cache.searchResults.set(cacheKey, {
      data: validStations,
      timestamp: Date.now()
    });

    return validStations;
  } catch (error) {
    console.error('Search stations error:', error);
    handleApiError(error);
  }
};

export const reportStationClick = async (stationId) => {
  try {
    if (!stationId) {
      console.warn('No station ID provided for click reporting');
      return;
    }
    console.log('Reporting click for station:', stationId);
    await api.clickStation(stationId);
    console.log('Click reported successfully');
  } catch (error) {
    console.error('Error reporting station click:', error);
    // Don't throw error for click reporting
  }
};
