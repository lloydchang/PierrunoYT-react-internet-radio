const API_BASE_URL = 'https://de1.api.radio-browser.info/json';

const fetchWithTimeout = async (url, options = {}) => {
    const timeout = 8000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'User-Agent': 'Radio WebUI/1.0',
                ...options.headers
            }
        });
        clearTimeout(id);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

const getTopStations = async (limit = 50, offset = 0) => {
    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            hidebroken: 'true',
            order: 'votes',
            reverse: 'true'
        });
        
        return await fetchWithTimeout(`${API_BASE_URL}/stations/search?${params}`);
    } catch (error) {
        console.error('Error fetching top stations:', error);
        throw error;
    }
};

const searchStations = async (query, limit = 50, offset = 0) => {
    try {
        const params = new URLSearchParams({
            name: query,
            limit: limit.toString(),
            offset: offset.toString(),
            hidebroken: 'true'
        });
        
        return await fetchWithTimeout(`${API_BASE_URL}/stations/search?${params}`);
    } catch (error) {
        console.error('Error searching stations:', error);
        throw error;
    }
};

const getStationsByTag = async (tag, limit = 50, offset = 0) => {
    try {
        const params = new URLSearchParams({
            tag,
            limit: limit.toString(),
            offset: offset.toString(),
            hidebroken: 'true'
        });
        
        return await fetchWithTimeout(`${API_BASE_URL}/stations/search?${params}`);
    } catch (error) {
        console.error('Error fetching stations by tag:', error);
        throw error;
    }
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

export const radioAPI = {
    getTopStations,
    searchStations,
    getStationsByTag,
    reportStationClick
};
