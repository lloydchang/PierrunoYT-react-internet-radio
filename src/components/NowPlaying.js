import React, { useState, useEffect, useCallback } from 'react';

function NowPlaying({ station }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNowPlaying = useCallback(async () => {
    if (!station?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`https://de1.api.radio-browser.info/json/stations/nowplaying/${station.id}`);
      if (!response.ok) throw new Error('Failed to fetch current song');
      
      const data = await response.json();
      if (data && data.length > 0) {
        setCurrentSong(data[0].now_playing);
      }
    } catch (err) {
      console.error('Error fetching now playing:', err);
      setError('Unable to fetch current song');
    } finally {
      setIsLoading(false);
    }
  }, [station?.id]);

  useEffect(() => {
    fetchNowPlaying();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  if (isLoading) {
    return (
      <div className="now-playing loading">
        <div className="loading-dots">
          <span>Now Playing</span>
          <span className="dots">...</span>
        </div>
      </div>
    );
  }

  if (error || !currentSong) {
    return (
      <div className="now-playing">
        <span className="now-playing-label">Now Playing</span>
        <span className="now-playing-title">Live Stream</span>
      </div>
    );
  }

  return (
    <div className="now-playing">
      <span className="now-playing-label">Now Playing</span>
      <span className="now-playing-title">{currentSong}</span>
    </div>
  );
}

export default NowPlaying;
