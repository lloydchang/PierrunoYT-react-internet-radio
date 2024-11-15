import { RadioBrowserApi } from 'radio-browser-api';

// Initialize the API with custom configuration
let api = null;

// List of fallback API endpoints
const API_ENDPOINTS = [
  'de1.api.radio-browser.info',
  'fr1.api.radio-browser.info',
  'at1.api.radio-browser.info'
];

const initializeApi = async () => {
  if (!api) {
    // Get list of available servers first
    try {
      const response = await fetch('https://all.api.radio-browser.info/json/servers');
      const servers = await response.json();
      
      // Try each server until one works
      for (const server of servers) {
        try {
          api = new RadioBrowserApi('InternetRadioWebUI/1.0.0', server.name);
          // Test connection and get server config
          const config = await api.getServerConfig();
          console.log(`Connected to ${server.name}, cache TTL: ${config.cache_ttl}s`);
          
          // Store server config for cache management
          cache.serverConfig = config;
          break;
        } catch (error) {
          console.warn(`Failed to connect to ${server.name}:`, error);
          api = null;
        }
      }
    } catch (error) {
      console.error('Failed to get server list:', error);
    }

    if (!api) {
      // Fallback to hardcoded endpoints if server discovery fails
      for (const endpoint of API_ENDPOINTS) {
        try {
          api = new RadioBrowserApi('InternetRadioWebUI/1.0.0', endpoint);
          await api.searchStations({ limit: 1 });
          console.log(`Connected to fallback endpoint ${endpoint}`);
          break;
        } catch (error) {
          console.warn(`Failed to connect to ${endpoint}:`, error);
          api = null;
        }
      }
    }
    
    if (!api) {
      throw new Error('Unable to connect to any radio service endpoint. Please try again later.');
    }
  }
  return api;
};

// Helper function for exponential backoff
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (fetchFn, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      if (error.message.includes('429')) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`);
        await wait(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

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
    await initializeApi();
    clearExpiredCache();

    // Return cached results if valid based on server config TTL
    const cacheTTL = cache.serverConfig?.cache_ttl || 300; // Default 5 min
    if (cache.stations && cache.timestamp && 
        (Date.now() - cache.timestamp < cacheTTL * 1000)) {
      console.log('Returning cached stations');
      return cache.stations;
    }

    console.log('Fetching stations...');

    // Get total station count first
    const stats = await api.getServerStats();
    const totalStations = stats.stations || 10000;
    const batchSize = 2000;
    const maxBatches = Math.min(Math.ceil(totalStations / batchSize), 5);
    
    let allStations = [];
    
    for (let i = 0; i < maxBatches; i++) {
      console.log(`Fetching batch ${i + 1}/${maxBatches}...`);
      
      const batch = await fetchWithRetry(async () => {
        return api.searchStations({
          limit: batchSize,
          offset: i * batchSize,
          hidebroken: true,
          order: 'clickcount',
          reverse: true,
          lastCheckOk: true,
          bitrateMin: 64,
          codec: ['MP3', 'AAC', 'OGG', 'OPUS'],
          has_geo_info: true,
          has_extended_info: true,
          is_https: true
        });
      });

      if (!batch || batch.length === 0) break;
      
      // Filter out stations with missing essential data
      const validStations = batch.filter(station => {
        return station && 
               station.name &&
               station.url_resolved &&
               station.codec &&
               station.bitrate >= 64 &&
               !station.name.toLowerCase().includes('undefined') &&
               !station.name.toLowerCase().includes('null');
      });

      allStations = [...allStations, ...validStations];
      
      // Respect server rate limits
      await wait(cache.serverConfig?.check_pause_seconds * 100 || 500);
    }
    console.log(`Total stations fetched: ${allStations.length}`);

    const stations = allStations;

    console.log('Raw stations response:', stations);

    if (!Array.isArray(stations)) {
      throw new Error('Invalid response from server: expected array of stations');
    }

    // Filter out invalid stations with more lenient criteria
    const validStations = stations.filter(station => {
      // Basic validation
      if (!station || typeof station !== 'object') return false;
      
      // Check for essential properties
      const hasEssentials = Boolean(
        station.stationuuid && 
        station.url_resolved && // Prefer resolved URL
        station.name
      );

      if (!hasEssentials) {
        console.log('Filtered out station missing essential properties:', station);
        return false;
      }

      // Additional quality checks
      const isQualityOk = 
        !station.name.toLowerCase().includes('undefined') &&
        !station.name.toLowerCase().includes('null') &&
        station.name.length > 1 &&
        (!station.bitrate || station.bitrate >= 64); // Minimum bitrate threshold

      if (!isQualityOk) {
        console.log('Filtered out low quality station:', station);
        return false;
      }

      // Codec validation
      if (station.codec) {
        const supportedCodecs = ['MP3', 'AAC', 'AAC+', 'OGG', 'OPUS'];
        const codec = station.codec.toUpperCase();
        if (!supportedCodecs.some(supported => codec.includes(supported))) {
          console.log('Filtered out station with unsupported codec:', station.codec);
          return false;
        }
      }

      // HLS stream validation
      if (station.hls && !station.url_resolved.includes('.m3u8')) {
        console.log('Filtered out invalid HLS stream:', station);
        return false;
      }

      return true;
    });

    console.log(`Found ${validStations.length} valid stations`);

    if (validStations.length === 0) {
      console.warn('No stations passed validation criteria. Retrying with relaxed filters...');
      // Retry with more relaxed criteria
      return api.searchStations({
        limit: 1000,
        hidebroken: true,
        order: 'clickcount',
        reverse: true
      });
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
    await initializeApi();
    clearExpiredCache();
    // Check cache for this search term
    const cacheKey = searchTerm.toLowerCase();
    const cachedResult = cache.searchResults.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_DURATION)) {
      console.log('Returning cached search results for:', searchTerm);
      return cachedResult.data;
    }

    console.log('Searching for stations with term:', searchTerm);

    // Search in batches to get more results
    const batchSize = 5000;
    let allStations = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore && offset < 30000) {
      const batch = await api.searchStations({
        name: searchTerm,
        nameExact: false,
        limit: batchSize,
        offset: offset,
        hidebroken: true,
        bitrateMin: 64,
        codec: ['MP3', 'AAC', 'OGG', 'OPUS'],
        removeDuplicates: true,
        order: 'clickcount',
        reverse: true,
        lastCheckOk: true
      });

      if (!batch || batch.length === 0) {
        hasMore = false;
      } else {
        allStations = [...allStations, ...batch];
        offset += batchSize;
      }
    }

    const stations = allStations;

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

export const reportStationClick = async (stationUuid) => {
  try {
    await initializeApi();
    if (!stationUuid) {
      console.warn('No station UUID provided for click reporting');
      return;
    }
    console.log('Reporting click for station:', stationUuid);
    await api.click(stationUuid);
    console.log('Click reported successfully');
  } catch (error) {
    console.error('Error reporting station click:', error);
    // Don't throw error for click reporting
  }
};
