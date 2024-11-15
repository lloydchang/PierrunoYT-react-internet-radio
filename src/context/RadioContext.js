import React, { createContext, useContext, useReducer } from 'react';

const RadioContext = createContext();

const initialState = {
  stations: [],
  currentStation: null,
  loading: false,
  error: null,
  searchQuery: ''
};

const radioReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATIONS':
      return { ...state, stations: action.payload, loading: false, error: null };
    case 'SET_CURRENT_STATION':
      return { ...state, currentStation: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

export const RadioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(radioReducer, initialState);

  return (
    <RadioContext.Provider value={{ state, dispatch }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
};
