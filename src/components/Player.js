import React, { useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { IoClose } from 'react-icons/io5';
import 'react-h5-audio-player/lib/styles.css';
import { radioAPI } from '../services/radioAPI';

function Player({ station, onClose }) {
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

    const handleError = (e) => {
        console.error('Audio Player Error:', e);
        setError('Failed to play this station. Please try another one.');
        setIsPlaying(false);
    };

    return (
        <div className="player">
            <div className="player-header">
                <div className="station-info">
                    <div className="station-main-info">
                        {station.favicon && (
                            <img
                                src={station.favicon}
                                alt={station.name}
                                className="station-logo"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <div className="station-details">
                            <h3>{station.name}</h3>
                            <div className="station-meta">
                                {station.tags && (
                                    <span className="station-tag">
                                        {Array.isArray(station.tags)
                                            ? station.tags[0]
                                            : station.tags.split(',')[0]}
                                    </span>
                                )}
                                {station.countrycode && (
                                    <span className="station-country">{station.countrycode}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        className="close-button" 
                        onClick={onClose}
                        aria-label="Close player"
                    >
                        <IoClose />
                    </button>
                </div>
            </div>

            {error ? (
                <div className="player-error">
                    <p>{error}</p>
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
                    className="radio-player"
                />
            )}
        </div>
    );
}

export default Player;
