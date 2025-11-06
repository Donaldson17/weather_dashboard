const API_KEY = '23c37161d363f3662704bb7d05a0a0b5';                 
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) return;

    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            displayWeather(data);
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
    document.getElementById('weather').style.display = 'block';
}

document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});