const API_KEY = '23c37161d363f3662704bb7d05a0a0b5';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

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
    'mist': '🌫️'
};

async function getWeather(cityName) {
    const city = cityName || document.getElementById('cityInput').value;
    if (!city) return;

    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            displayWeather(data);
            saveRecentCity(city);
        } else {
            alert('City not found');
        }
    } catch (error) {
        alert('Error fetching weather data');
    }
}

function displayWeather(data) {
    document.getElementById('city').textContent = data.name;
    document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('desc').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').textContent = weatherIcons[data.weather[0].description] || '🌤️';
    document.getElementById('weather').style.display = 'block';
    
    setBackground(data.weather[0].main.toLowerCase());
}

function setBackground(weather) {
    document.body.className = '';
    if (weather.includes('clear')) document.body.classList.add('sunny');
    else if (weather.includes('rain') || weather.includes('drizzle')) document.body.classList.add('rainy');
    else if (weather.includes('cloud')) document.body.classList.add('cloudy');
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

document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

displayRecentCities();