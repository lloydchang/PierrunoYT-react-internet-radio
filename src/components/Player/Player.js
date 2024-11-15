import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AudioPlayer from 'react-h5-audio-player';
import { IoClose } from 'react-icons/io5';
import { radioAPI } from '../../services/radioAPI';
import styles from './Player.module.css';
import 'react-h5-audio-player/lib/styles.css';

const Player = ({ station, onClose }) => {
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (station) {
      setError(null);
      setIsPlaying(false);
    }
  }, [station]);

  if (!station) return null;

  const handlePlay = () => {
    setIsPlaying(true);
    radioAPI.reportStationClick(station.id);
  };

  const handleError = () => {
    setError('Unable to play this station. Please try another one.');
    setIsPlaying(false);
  };

  const getFirstTag = (tags) => {
    if (!tags) return null;
    return Array.isArray(tags) ? tags[0] : tags.split(',')[0];
  };

  return (
    <div className={styles.player} role="region" aria-label="Audio player">
      <div className={styles.header}>
        <div className={styles.stationInfo}>
          <div className={styles.mainInfo}>
            {station.favicon && (
              <img
                src={station.favicon}
                alt=""
                className={styles.logo}
                onError={(e) => e.target.style.display = 'none'}
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
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close player"
          >
            <IoClose size={24} />
          </button>
        </div>
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : (
        <AudioPlayer
          src={station.url_resolved || station.url}
          showJumpControls={false}
          layout="stacked"
          customProgressBarSection={[]}
          customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
          autoPlayAfterSrcChange={true}
          defaultCurrentTime="Live Stream"
          defaultDuration="Live"
          onPlay={handlePlay}
          onError={handleError}
          playing={isPlaying}
          className={styles.radioPlayer}
          autoPlay={false}
          volume={0.8}
        />
      )}
    </div>
  );
};

Player.propTypes = {
  station: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    favicon: PropTypes.string,
    url: PropTypes.string.isRequired,
    url_resolved: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    countrycode: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired
};

export default Player;
