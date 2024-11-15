const SHOUTCAST_API_KEY = 'YOUR_API_KEY'; // You'll need to get an API key from Shoutcast
const BASE_URL = 'https://directory.shoutcast.com/Home/BrowseByGenre';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const fetchStations = async () => {
  try {
    const response = await fetch(`${BASE_URL}?k=${SHOUTCAST_API_KEY}&limit=500`);
    const data = await handleResponse(response);
    
    return data.map(station => ({
      id: station.id,
      name: station.name,
      url: station.tunein.base + station.tunein.path,
      bitrate: station.bitrate,
      genre: station.genre,
      listeners: station.listeners,
      codec: 'MP3', // Shoutcast typically uses MP3
      countrycode: station.country || 'Unknown',
      votes: station.listeners, // Use listeners count as popularity metric
      favicon: station.logo || null
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw new Error('Failed to load radio stations');
  }
};

export const searchStations = async (searchTerm) => {
  try {
    const response = await fetch(
      `${BASE_URL}/Search?k=${SHOUTCAST_API_KEY}&search=${encodeURIComponent(searchTerm)}&limit=200`
    );
    const data = await handleResponse(response);
    
    return data.map(station => ({
      id: station.id,
      name: station.name,
      url: station.tunein.base + station.tunein.path,
      bitrate: station.bitrate,
      genre: station.genre,
      listeners: station.listeners,
      codec: 'MP3',
      countrycode: station.country || 'Unknown',
      votes: station.listeners,
      favicon: station.logo || null
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Error searching stations');
  }
};

export const reportStationClick = async (stationId) => {
  // Shoutcast doesn't have a click reporting endpoint
  console.log('Click tracking not available for station:', stationId);
};
