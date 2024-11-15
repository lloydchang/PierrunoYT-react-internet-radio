import React from 'react';
import PropTypes from 'prop-types';
import styles from './StationCard.module.css';

const StationCard = ({ station, isSelected, onSelect }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(station);
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  const getFirstTag = (tags) => {
    if (!tags) return null;
    return Array.isArray(tags) ? tags[0] : tags.split(',')[0];
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(station)}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Play ${station.name}`}
    >
      <div className={styles.stationInfo}>
        {station.favicon && (
          <img
            src={station.favicon}
            alt=""
            className={styles.logo}
            onError={handleImageError}
            aria-hidden="true"
          />
        )}
        <div className={styles.details}>
          <h3 className={styles.name}>{station.name}</h3>
          <div className={styles.meta}>
            {station.tags && (
              <span className={styles.tag}>
                {getFirstTag(station.tags)}
              </span>
            )}
            {station.countrycode && (
              <span className={styles.country}>
                {station.countrycode}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

StationCard.propTypes = {
  station: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    favicon: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    countrycode: PropTypes.string
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default StationCard;
