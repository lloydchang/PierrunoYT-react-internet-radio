# React Internet Radio

A modern web application for streaming internet radio stations, built with React. This application provides a clean, intuitive interface for discovering and listening to radio stations from around the world.

![React Internet Radio](https://img.shields.io/badge/React-Internet_Radio-61DAFB?style=for-the-badge&logo=react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/PierrunoYT/react-internet-radio/blob/main/LICENSE)

![Application Screenshot](Screenshot%202024-11-15%20162148.png)

## Features

- 🎵 Stream radio stations from around the world
- 🔍 Real-time station search functionality
- 📻 Detailed station information display
- 🎧 Built-in audio player with controls
- 💫 Responsive and modern user interface
- 🚀 Performance optimized with smart caching

## Tech Stack

- **Frontend Framework**: React
- **State Management**: React Context API
- **Styling**: CSS Modules
- **API Integration**: Custom Radio Browser API service

## Project Structure

```
src/
├── components/
│   ├── Player/          # Audio player component
│   ├── SearchBar/       # Station search functionality
│   ├── StationCard/     # Individual station display
│   └── StationList/     # List of radio stations
├── context/
│   └── RadioContext.js  # Global state management
├── hooks/
│   └── useRadioOperations.js  # Custom radio operations hook
├── services/
│   └── radioAPI.js      # API integration service
└── App.js               # Main application component
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/PierrunoYT/react-internet-radio.git
cd react-internet-radio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](https://github.com/PierrunoYT/react-internet-radio/blob/main/LICENSE) - Copyright (c) 2024 PierrunoYT
