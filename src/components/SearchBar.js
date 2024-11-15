import React, { useState, useEffect } from 'react';

function SearchBar({ onSearch, initialValue = '', disabled = false }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Only auto-search if the search field is being cleared
    if (value === '') {
      onSearch(value);
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search stations..."
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
          disabled={disabled}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={disabled}
        >
          🔍 Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
