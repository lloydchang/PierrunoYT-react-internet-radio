/**
 * Base URL for the Radio Browser API
 */
const API_BASE = 'https://de1.api.radio-browser.info/json';

/**
 * Handles API response and error checking
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If the response is not ok
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Radio Browser API service
 */
export const radioAPI = {
  /**
   * Fetches top voted radio stations
   * @param {number} limit - Number of stations to fetch
   * @returns {Promise<Array>} Array of radio stations
   */
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

  /**
   * Searches for radio stations by name
   * @param {string} searchTerm - Search query
   * @returns {Promise<Array>} Array of matching radio stations
   */
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

  /**
   * Reports a station click/play event
   * @param {string|number} stationId - ID of the station
   * @returns {Promise<void>}
   */
  async reportStationClick(stationId) {
    try {
      await fetch(`${API_BASE}/url/${stationId}`);
    } catch (error) {
      console.error('Error reporting click:', error);
      // Don't throw error for click reporting as it's not critical
    }
  }
};
