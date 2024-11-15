const API_BASE_URL = 'https://de1.api.radio-browser.info/json';

const handleResponse = async (response) => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchWithTimeout = async (url, options = {}) => {
    const timeout = 8000; // 8 seconds timeout
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

const fetchStations = async (params) => {
    try {
        const queryParams = new URLSearchParams(params);
        const response = await fetchWithTimeout(`${API_BASE_URL}/stations/search?${queryParams}`);
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching radio stations:', error);
        throw error;
    }
};

const getStationsByName = async (name, limit = 50, offset = 0) => {
    return fetchStations({
        name: name,
        limit: limit.toString(),
        offset: offset.toString(),
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true'
    });
};

const getTopStations = async (limit = 50, offset = 0) => {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true'
    });

    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/stations?${params}`);
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching top stations:', error);
        throw error;
    }
};

const getStationsByCountry = async (countryCode, limit = 50, offset = 0) => {
    const params = new URLSearchParams({
        countrycode: countryCode.toLowerCase(),
        limit: limit.toString(),
        offset: offset.toString(),
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true'
    });

    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/stations/search?${params}`);
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching stations by country:', error);
        throw error;
    }
};

const getStationsByTag = async (tag, limit = 50, offset = 0) => {
    return fetchStations({
        tag: tag,
        limit: limit.toString(),
        offset: offset.toString(),
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true'
    });
};

const reportStationClick = async (stationId) => {
    try {
        await fetchWithTimeout(`${API_BASE_URL}/url/${stationId}`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error reporting station click:', error);
    }
};

const getStationsByCountryCode = async (countryCode, limit = 50, offset = 0) => {
    const params = new URLSearchParams({
      countrycode: countryCode.toLowerCase(),
      limit: limit.toString(),
      offset: offset.toString(),
      order: 'votes',
      reverse: 'true'
    });

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/stations/search?${params}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching stations by country:', error);
      throw error;
    }
  };

export const radioAPI = {
    getStationsByName,
    getTopStations,
    getStationsByCountry,
    getStationsByTag,
    reportStationClick,
    getStationsByCountryCode
};
