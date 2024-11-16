import React from 'react';
import { RadioProvider } from './context/RadioContext';
import { ThemeProvider } from './context/ThemeContext';
import { useRadioOperations } from './hooks/useRadioOperations';
import { useTheme } from './context/ThemeContext';
import { IoMoon, IoSunny } from 'react-icons/io5';
import SearchBar from './components/SearchBar/SearchBar';
import StationList from './components/StationList/StationList';
import Player from './components/Player/Player';
import styles from './App.module.css';

const AppContent = () => {
  const { currentStation, setCurrentStation } = useRadioOperations();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Internet Radio</h1>
          <button 
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <IoSunny size={24} /> : <IoMoon size={24} />}
          </button>
        </div>
        <div className={styles.headerControls}>
          <SearchBar />
        </div>
      </header>

      <main>
        <StationList />
      </main>

      {currentStation && (
        <Player
          station={currentStation}
          onClose={() => setCurrentStation(null)}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <RadioProvider>
        <AppContent />
      </RadioProvider>
    </ThemeProvider>
  );
};

export default App;
