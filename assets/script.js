document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = '72e7cf3f0426c04d2b78538def275e7f'; // Your API key
    const BASE_URL_CURRENT = 'https://api.openweathermap.org/data/2.5/weather';
    const BASE_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const currentWeatherContainer = document.getElementById('current-weather');
    const forecastContainer = document.getElementById('forecast');
    const searchHistoryContainer = document.getElementById('search-history');

    async function fetchWeather(city) {
        const url = `${BASE_URL_CURRENT}?q=${city}&appid=${API_KEY}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    }

    async function fetchForecast(city) {
        const url = `${BASE_URL_FORECAST}?q=${city}&appid=${API_KEY}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            return null;
        }
    }

    function kelvinToFahrenheit(kelvin) {
        return (kelvin - 273.15) * 9/5 + 32;
    }

    function renderCurrentWeather(weatherData) {
        const tempFahrenheit = kelvinToFahrenheit(weatherData.main.temp);
        currentWeatherContainer.innerHTML = `
            <h2>${weatherData.name} (${weatherData.sys.country})</h2>
            <p>Temperature: ${tempFahrenheit.toFixed(2)} °F</p>
            <p>Humidity: ${weatherData.main.humidity}%</p>
            <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
            <p>Weather: ${weatherData.weather[0].description}</p>
        `;
    }

    function renderForecast(forecastData) {
        forecastContainer.innerHTML = '';
        
        const processedDates = new Set();
    
        forecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    
            if (!processedDates.has(day)) {
                processedDates.add(day);
                
                const temperature = kelvinToFahrenheit(forecast.main.temp);
                const humidity = forecast.main.humidity;
                const weatherDescription = forecast.weather[0].description;
                
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');
                forecastItem.innerHTML = `
                    <h3>${day}</h3>
                    <p>Temperature: ${temperature.toFixed(2)} °F</p>
                    <p>Humidity: ${humidity}%</p>
                    <p>Weather: ${weatherDescription}</p>
                `;
                forecastContainer.appendChild(forecastItem);
            }
        });
    }

    function updateSearchHistory(city) {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.unshift(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        renderSearchHistory();
    }

    function renderSearchHistory() {
        searchHistoryContainer.innerHTML = '';
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.forEach(city => {
            const listItem = document.createElement('li');
            listItem.textContent = city;
            listItem.addEventListener('click', async () => {
                const weatherData = await fetchWeather(city);
                const forecastData = await fetchForecast(city);
                if (weatherData && forecastData) {
                    renderCurrentWeather(weatherData);
                    renderForecast(forecastData);
                } else {
                    console.log('No weather data available for', city);
                }
            });
            searchHistoryContainer.appendChild(listItem);
        });
    }

    renderSearchHistory();

    searchForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            const weatherData = await fetchWeather(city);
            const forecastData = await fetchForecast(city);
            if (weatherData && forecastData) {
                renderCurrentWeather(weatherData);
                renderForecast(forecastData);
                updateSearchHistory(city);
            } else {
                console.log('No weather data available for', city);
            }
        } else {
            console.log('Please enter a city name');
        }
    });
});
