import React from 'react';

function StationList({ stations, onStationSelect, currentStation }) {
  const formatTags = (tags) => {
    if (!tags) return '';
    return tags.split(',')
      .slice(0, 3)
      .map(tag => tag.trim())
      .join(' • ');
  };

  const getStationLanguage = (station) => {
    if (!station.language) return '';
    return station.language.split(',')[0].trim();
  };

  return (
    <div className="station-list">
      {stations.map(station => (
        <div 
          key={station.id || station.stationuuid}
          className={`station-item ${currentStation?.id === station.id ? 'active' : ''}`}
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
            <div className="station-icon">
              {station.favicon ? (
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
              ) : (
                <div className="station-favicon station-favicon-placeholder">
                  📻
                </div>
              )}
            </div>
            
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
              </div>

              <div className="station-info-row">
                {station.language && (
                  <span className="station-language" title="Language">
                    {getStationLanguage(station)}
                  </span>
                )}
                {station.countrycode && (
                  <span className="station-country" title="Country">
                    {station.countrycode}
                  </span>
                )}
              </div>

              {station.tags && (
                <p className="station-tags" title="Tags">
                  {formatTags(station.tags)}
                </p>
              )}
            </div>

            {station.votes > 0 && (
              <div className="station-votes" title="Votes">
                <span className="vote-count">
                  ⭐ {station.votes}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StationList;
