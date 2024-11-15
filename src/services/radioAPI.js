const BASE_URL = 'https://de1.api.radio-browser.info/json';

const fetchStations = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${BASE_URL}/stations/search?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching radio stations:', error);
        throw error;
    }
};

const getStationsByName = (name, limit = 30) => {
    return fetchStations({
        name: name,
        limit: limit,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const getTopStations = (limit = 30) => {
    return fetchStations({
        limit: limit,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const getStationsByCountry = (country, limit = 30) => {
    return fetchStations({
        country: country,
        limit: limit,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

const getStationsByTag = (tag, limit = 30) => {
    return fetchStations({
        tag: tag,
        limit: limit,
        hidebroken: true,
        order: 'votes',
        reverse: true
    });
};

export const radioAPI = {
    getStationsByName,
    getTopStations,
    getStationsByCountry,
    getStationsByTag
};
