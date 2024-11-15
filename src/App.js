import React from 'react';
import { RadioProvider } from './context/RadioContext';
import { useRadioOperations } from './hooks/useRadioOperations';
import SearchBar from './components/SearchBar/SearchBar';
import StationList from './components/StationList/StationList';
import Player from './components/Player/Player';
import styles from './App.module.css';

const AppContent = () => {
  const { currentStation, setCurrentStation } = useRadioOperations();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Internet Radio</h1>
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
    <RadioProvider>
      <AppContent />
    </RadioProvider>
  );
};

export default App;
