import { useCallback } from 'react';
import { useRadio } from '../context/RadioContext';
import { radioAPI } from '../services/radioAPI';

export const useRadioOperations = () => {
  const { state, dispatch } = useRadio();

  const loadStations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await radioAPI.getTopStations(100);
      dispatch({ type: 'SET_STATIONS', payload: data });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load radio stations. Please try again.'
      });
      console.error('Error loading stations:', err);
    }
  }, [dispatch]);

  const searchStations = useCallback(async (query) => {
    if (!query.trim()) {
      return loadStations();
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await radioAPI.searchStations(query);
      dispatch({ type: 'SET_STATIONS', payload: data });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to search radio stations. Please try again.'
      });
      console.error('Error searching stations:', err);
    }
  }, [dispatch, loadStations]);

  const setCurrentStation = useCallback((station) => {
    dispatch({ type: 'SET_CURRENT_STATION', payload: station });
  }, [dispatch]);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  return {
    stations: state.stations,
    currentStation: state.currentStation,
    loading: state.loading,
    error: state.error,
    searchQuery: state.searchQuery,
    loadStations,
    searchStations,
    setCurrentStation,
    setSearchQuery
  };
};
