import React from 'react';

function SortControls({ sortBy, onSortChange }) {
  return (
    <div className="sort-controls">
      <label>
        Sort by:
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="popularity">Popularity</option>
          <option value="country">Country</option>
          <option value="language">Language</option>
          <option value="name">Name</option>
        </select>
      </label>
    </div>
  );
}

export default SortControls;
