import React, { useEffect } from 'react';
import { useRadioOperations } from '../../hooks/useRadioOperations';
import StationCard from '../StationCard/StationCard';
import styles from './StationList.module.css';

const StationList = () => {
  const {
    stations,
    currentStation,
    loading,
    error,
    loadStations,
    setCurrentStation
  } = useRadioOperations();

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status">
        <div className={styles.spinner} aria-hidden="true" />
        <p>Loading stations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer} role="alert">
        <p>{error}</p>
        <button
          className={styles.retryButton}
          onClick={loadStations}
          aria-label="Try loading stations again"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>No radio stations found.</p>
        <button
          className={styles.showAllButton}
          onClick={loadStations}
          aria-label="Show all stations"
        >
          Show All Stations
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {stations.map((station) => (
          <StationCard
            key={station.id || station.stationuuid}
            station={station}
            isSelected={currentStation?.id === station.id}
            onSelect={setCurrentStation}
          />
        ))}
      </div>
    </div>
  );
};

export default StationList;
