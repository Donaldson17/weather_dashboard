const API_KEY = '7ee10e68e3a336dc8da320437d67b94b';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

let currentUnit = 'metric';
let currentWeatherData = null;

const weatherIcons = {
    'clear sky': '☀️',
    'few clouds': '🌤️',
    'scattered clouds': '☁️',
    'broken clouds': '☁️',
    'overcast clouds': '☁️',
    'light rain': '🌦️',
    'moderate rain': '🌧️',
    'heavy rain': '🌧️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️'
};

async function getWeather(cityName) {
    const city = cityName || document.getElementById('cityInput').value;
    if (!city) return;

    showLoading(true);
    
    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=${currentUnit}`),
            fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=${currentUnit}`)
        ]);
        
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        if (weatherResponse.ok && forecastResponse.ok) {
            currentWeatherData = weatherData;
            displayWeather(weatherData);
            displayForecast(forecastData);
            saveRecentCity(city);
            updateLocalTime(weatherData.timezone);
            createWeatherParticles(weatherData.weather[0].main.toLowerCase());
        } else {
            alert('City not found');
        }
    } catch (error) {
        alert('Error fetching weather data');
    } finally {
        showLoading(false);
    }
}

function displayWeather(data) {
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';
    
    document.getElementById('city').textContent = data.name;
    document.getElementById('temp').textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}${tempUnit}`;
    document.getElementById('desc').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').textContent = weatherIcons[data.weather[0].description] || '🌤️';
    
    // Weather details
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('humidityBar').style.width = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} ${windUnit}`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Sunrise/Sunset
    document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise, data.timezone);
    document.getElementById('sunset').textContent = formatTime(data.sys.sunset, data.timezone);
    
    document.getElementById('weather').style.display = 'block';
    setBackground(data.weather[0].main.toLowerCase(), data.timezone);
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    const dailyForecasts = {};
    
    // Group forecasts by day
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });
    
    const forecasts = Object.values(dailyForecasts).slice(1, 6); // Next 5 days
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    
    forecastContainer.innerHTML = forecasts.map(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en', { weekday: 'short' });
        const icon = weatherIcons[forecast.weather[0].description] || '🌤️';
        const temp = Math.round(forecast.main.temp);
        
        return `
            <div class="forecast-item">
                <div class="forecast-day">${day}</div>
                <div class="forecast-icon">${icon}</div>
                <div class="forecast-temp">${temp}${tempUnit}</div>
            </div>
        `;
    }).join('');
}

function setBackground(weather, timezone) {
    const now = new Date();
    const localTime = new Date(now.getTime() + timezone * 1000);
    const hour = localTime.getUTCHours();
    const isNight = hour < 6 || hour > 18;
    
    document.body.className = '';
    
    if (isNight) {
        document.body.classList.add('night');
    } else if (weather.includes('clear')) {
        document.body.classList.add('sunny');
    } else if (weather.includes('rain') || weather.includes('drizzle')) {
        document.body.classList.add('rainy');
    } else if (weather.includes('cloud')) {
        document.body.classList.add('cloudy');
    }
}

function createWeatherParticles(weather) {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
    
    if (weather.includes('rain')) {
        for (let i = 0; i < 50; i++) {
            createParticle('rain', particlesContainer);
        }
    } else if (weather.includes('snow')) {
        for (let i = 0; i < 30; i++) {
            createParticle('snow', particlesContainer);
        }
    }
}

function createParticle(type, container) {
    const particle = document.createElement('div');
    particle.className = `particle ${type}`;
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 5000);
}

function updateLocalTime(timezone) {
    const now = new Date();
    const localTime = new Date(now.getTime() + timezone * 1000);
    const timeString = localTime.toUTCString().slice(-12, -4);
    document.getElementById('localTime').textContent = `Local time: ${timeString}`;
}

function formatTime(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toUTCString().slice(-12, -7);
}

function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    document.getElementById('unitToggle').textContent = currentUnit === 'metric' ? '°F' : '°C';
    
    if (currentWeatherData) {
        getWeather(currentWeatherData.name);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`${API_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}`);
                    const data = await response.json();
                    
                    if (response.ok) {
                        currentWeatherData = data;
                        displayWeather(data);
                        
                        const forecastResponse = await fetch(`${FORECAST_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}`);
                        const forecastData = await forecastResponse.json();
                        displayForecast(forecastData);
                        
                        saveRecentCity(data.name);
                        updateLocalTime(data.timezone);
                        createWeatherParticles(data.weather[0].main.toLowerCase());
                    }
                } catch (error) {
                    alert('Error getting location weather');
                } finally {
                    showLoading(false);
                }
            },
            () => {
                alert('Location access denied');
                showLoading(false);
            }
        );
    } else {
        alert('Geolocation not supported');
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('searchBtn').disabled = show;
}

function saveRecentCity(city) {
    let recent = JSON.parse(localStorage.getItem('recentCities') || '[]');
    recent = recent.filter(c => c !== city);
    recent.unshift(city);
    recent = recent.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(recent));
    displayRecentCities();
}

function displayRecentCities() {
    const recent = JSON.parse(localStorage.getItem('recentCities') || '[]');
    const container = document.getElementById('recentCities');
    container.innerHTML = recent.map(city => 
        `<span class="recent-city" onclick="getWeather('${city}')">${city}</span>`
    ).join('');
}

function toggleFavorite() {
    if (!currentWeatherData) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const cityName = currentWeatherData.name;
    const isFavorite = favorites.includes(cityName);
    
    if (isFavorite) {
        const index = favorites.indexOf(cityName);
        favorites.splice(index, 1);
        document.getElementById('favoriteBtn').textContent = '⭐';
    } else {
        favorites.push(cityName);
        document.getElementById('favoriteBtn').textContent = '🌟';
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function shareWeather() {
    if (!currentWeatherData) return;
    
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const text = `Weather in ${currentWeatherData.name}: ${Math.round(currentWeatherData.main.temp)}${tempUnit}, ${currentWeatherData.weather[0].description}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Weather Update',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Weather info copied to clipboard!');
        });
    }
}

// Event listeners
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Initialize
displayRecentCities();

// Update particles periodically
setInterval(() => {
    if (currentWeatherData) {
        const weather = currentWeatherData.weather[0].main.toLowerCase();
        if (weather.includes('rain') || weather.includes('snow')) {
            createWeatherParticles(weather);
        }
    }
}, 3000);