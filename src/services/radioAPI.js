// Radio Browser API service
const API_BASE = 'https://de1.api.radio-browser.info/json';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const radioAPI = {
  async getTopStations(limit = 50) {
    try {
      const response = await fetch(
        `${API_BASE}/stations/topvote/${limit}`
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching top stations:', error);
      throw new Error('Failed to load radio stations');
    }
  },

  async searchStations(searchTerm) {
    try {
      const response = await fetch(
        `${API_BASE}/stations/search?name=${encodeURIComponent(searchTerm)}&limit=100`
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Error searching stations');
    }
  },

  async reportStationClick(stationId) {
    try {
      await fetch(`${API_BASE}/url/${stationId}`);
    } catch (error) {
      console.error('Error reporting click:', error);
    }
  }
};
