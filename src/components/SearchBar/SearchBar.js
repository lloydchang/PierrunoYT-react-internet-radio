import React from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useRadioOperations } from '../../hooks/useRadioOperations';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const {
    searchQuery,
    loading,
    setSearchQuery,
    searchStations
  } = useRadioOperations();

  const handleSubmit = (e) => {
    e.preventDefault();
    searchStations(searchQuery);
  };

  return (
    <div className={styles.searchBar}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Search radio stations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
          aria-label="Search radio stations"
        />
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
          aria-label="Search"
        >
          <IoSearchOutline size={20} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
