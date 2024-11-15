import React, { useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { reportStationClick } from '../services/radioAPI';

function Player({ station }) {
  useEffect(() => {
    if (station) {
      reportStationClick(station.id);
    }
  }, [station]);

  if (!station) return null;

  return (
    <div className="player">
      <div className="player-info">
        <div className="station-details">
          <h2>{station.name}</h2>
          {station.favicon && (
            <img 
              src={station.favicon} 
              alt={station.name} 
              className="station-logo"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div className="station-metadata">
            {station.tags && (
              <p className="station-tags">{station.tags.split(',')[0]}</p>
            )}
            {station.countrycode && (
              <p className="station-country">{station.countrycode}</p>
            )}
          </div>
        </div>
      </div>

      <AudioPlayer
        src={station.url_resolved || station.url}
        showJumpControls={false}
        layout="stacked"
        customProgressBarSection={[]}
        customControlsSection={["MAIN_CONTROLS", "VOLUME_CONTROLS"]}
        autoPlayAfterSrcChange={true}
        defaultCurrentTime="Live Stream"
        defaultDuration="Live"
        className="radio-player"
        onError={(e) => {
          console.error('Audio Player Error:', e);
        }}
        onPlay={() => {
          reportStationClick(station.id);
        }}
      />
    </div>
  );
}

export default Player;
