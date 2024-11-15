import React, { useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import '../styles/RadioApp.css';
import { radioAPI } from '../services/radioAPI';
import NowPlaying from './NowPlaying';

function Player({ station, onClose }) {
  useEffect(() => {
    if (station) {
      radioAPI.reportStationClick(station.id);
    }
  }, [station]);

  if (!station) return null;

  return (
    <div className="player">
      <button className="close-player" onClick={onClose} title="Close player">
        ×
      </button>
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
              <p className="station-tags">
                {Array.isArray(station.tags) 
                  ? station.tags[0] 
                  : typeof station.tags === 'string' 
                    ? station.tags.split(',')[0] 
                    : ''}
              </p>
            )}
            {station.countrycode && (
              <p className="station-country">{station.countrycode}</p>
            )}
          </div>
        </div>
      </div>

      <NowPlaying station={station} />

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
          radioAPI.reportStationClick(station.id);
        }}
      />
    </div>
  );
}

export default Player;
