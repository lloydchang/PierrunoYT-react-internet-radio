const API_BASE_URL = 'https://de1.api.radio-browser.info/json';

const fetchStations = async (params) => {
    try {
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/stations/search?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch stations');
        return await response.json();
    } catch (error) {
        console.error('Error fetching radio stations:', error);
        throw error;
    }
};

const getStationsByName = (name, limit = 50, offset = 0) => {
    return fetchStations({
        name: name,
        limit: limit,
        offset: offset,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const getTopStations = (limit = 50, offset = 0) => {
    return fetchStations({
        limit: limit,
        offset: offset,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const getStationsByCountry = (country, limit = 50, offset = 0) => {
    return fetchStations({
        country: country,
        limit: limit,
        offset: offset,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const getStationsByTag = (tag, limit = 50, offset = 0) => {
    return fetchStations({
        tag: tag,
        limit: limit,
        offset: offset,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const reportStationClick = async (stationId) => {
    console.log('Click reported for station:', stationId);
    // Implementation can be added later if needed
};

export const radioAPI = {
    getStationsByName,
    getTopStations,
    getStationsByCountry,
    getStationsByTag,
    reportStationClick
};
