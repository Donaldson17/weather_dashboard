# Weather Dashboard

A simple weather app that displays current weather information for any city.

## Features

- Search weather by city name
- Shows temperature in Celsius
- Displays weather description
- Clean, responsive design

## How to Use

1. Open `index.html` in your browser
2. Enter a city name (e.g., "London", "Paris", "Tokyo")
3. Click Search or press Enter
4. View current weather data

## Setup

The app uses OpenWeatherMap API. To use your own API key:

1. Get free API key from [openweathermap.org](https://openweathermap.org/api)
2. Replace API key in `script.js` line 1:
   ```javascript
   const API_KEY = 'your_api_key_here';
   ```

## Files

- `index.html` - Main page structure
- `style.css` - Styling and layout
- `script.js` - Weather API functionality