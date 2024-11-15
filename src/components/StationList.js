import React, { useEffect, useRef, useCallback } from 'react';
import '../styles/RadioApp.css';

function StationList({ stations, onStationSelect, currentStation, sortBy, onLoadMore, hasMore, isLoadingMore }) {
  const observer = useRef();
  const lastStationElementRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore]);

  const getStationLanguage = (station) => {
    if (!station?.language || typeof station.language !== 'string') return '';
    const languages = station.language.split(',');
    return languages[0]?.trim() || '';
  };

  const sortedStations = [...stations].sort((a, b) => {
    switch (sortBy) {
      case 'country':
        return (a.countrycode || '').localeCompare(b.countrycode || '');
      case 'language':
        return getStationLanguage(a).localeCompare(getStationLanguage(b));
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'popularity':
      default:
        return (b.votes || 0) - (a.votes || 0);
    }
  });

  const formatTags = (tags) => {
    if (!tags) return '';
    const tagArray = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : [];
    return tagArray
      .filter(tag => tag && tag.trim())
      .slice(0, 3)
      .map(tag => tag.trim())
      .join(' • ');
  };

  return (
    <div className="stations-list">
      {sortedStations.map((station, index) => {
        const isLastElement = index === sortedStations.length - 1;
        const ref = isLastElement ? lastStationElementRef : null;
        const isSelected = currentStation?.id === station.id;

        return (
          <div
            key={station.id || station.stationuuid}
            ref={ref}
            className={`station-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onStationSelect(station)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onStationSelect(station);
              }
            }}
          >
            <div className="station-info">
              {station.favicon && (
                <img
                  src={station.favicon}
                  alt={station.name}
                  className="station-favicon"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>'
                    )}`;
                  }}
                />
              )}
              {!station.favicon && (
                <div className="station-favicon station-favicon-placeholder">
                  📻
                </div>
              )}
              <div className="station-details">
                <h3 className="station-name">{station.name}</h3>
                <div className="station-meta">
                  {station.codec && (
                    <span className="station-codec" title="Audio Format">
                      {station.codec.toUpperCase()}
                    </span>
                  )}
                  {station.bitrate && (
                    <span className="station-bitrate" title="Bitrate">
                      {station.bitrate} kbps
                    </span>
                  )}
                  {station.countrycode && (
                    <span className="station-country">{station.countrycode}</span>
                  )}
                  {getStationLanguage(station) && (
                    <span className="station-language">{getStationLanguage(station)}</span>
                  )}
                  <span className="station-votes">
                    {station.votes || 0} votes
                  </span>
                </div>
                {formatTags(station.tags) && (
                  <div className="station-tags">
                    {formatTags(station.tags)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {isLoadingMore && (
        <div className="loading-more">
          <div className="loading-spinner"></div>
          <p>Loading more stations...</p>
        </div>
      )}
    </div>
  );
}

export default StationList;
