
const API_KEY = "ffaa0ce08f97ce2268af3b689a30abee";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const currentWeatherEl = document.getElementById("currentWeather");
const forecastEl = document.getElementById("forecast");

// Helper: format day name
function getDayName(dtTxt) {
  const date = new Date(dtTxt);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Helper: format date dd MMM
function getNiceDate(dtTxt) {
  const date = new Date(dtTxt);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

// Render current weather
function renderCurrentWeather(data) {
  const cityName = data.name;
  const country = data.sys.country;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const wind = data.wind.speed;
  const desc = data.weather[0].description;
  const icon = data.weather[0].icon; 

  currentWeatherEl.innerHTML = `
    <div class="current-main">
      <div>
        <div class="city-name">${cityName}</div>
        <div class="country">${country}</div>
      </div>
      <div class="temp-main">${temp}°<span>C</span></div>
      <div class="current-extra">
        <div>Feels like <strong>${feelsLike}°</strong></div>
        <div>Humidity <strong>${humidity}%</strong></div>
        <div>Wind <strong>${wind} m/s</strong></div>
      </div>
    </div>
    <div class="current-icon">
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
      <div class="current-desc">${desc}</div>
    </div>
  `;
}


function renderForecast(data) {
 
  const list = data.list;


  const byDate = {};

  list.forEach((item) => {
    const [datePart, timePart] = item.dt_txt.split(" ");
    if (!byDate[datePart]) {
      byDate[datePart] = item; 
    }

    if (timePart === "12:00:00") {
      byDate[datePart] = item;
    }
  });

  const days = Object.keys(byDate).slice(0, 5);
  forecastEl.innerHTML = "";

  days.forEach((dateStr) => {
    const item = byDate[dateStr];
    const dayName = getDayName(item.dt_txt);
    const niceDate = getNiceDate(item.dt_txt);
    const temp = Math.round(item.main.temp);
    const desc = item.weather[0].description;
    const icon = item.weather[0].icon;

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-date">${niceDate}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" />
      <div class="forecast-temp">${temp}°<span>C</span></div>
      <div class="forecast-desc">${desc}</div>
    `;
    forecastEl.appendChild(card);
  });
}

async function fetchWeather(city) {
  if (!city) {
    statusEl.textContent = "Please enter a city name.";
    statusEl.className = "status error";
    return;
  }

  statusEl.textContent = "Loading weather data...";
  statusEl.className = "status loading";

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

  console.log("Current URL:", currentUrl);
  console.log("Forecast URL:", forecastUrl);

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentRes.ok) {
      if (currentRes.status === 404) {
        statusEl.textContent = "City not found. Try another name.";
      } else if (currentRes.status === 401) {
        statusEl.textContent = "401: Check your API key in script.js.";
      } else {
        statusEl.textContent = `Error: ${currentRes.status}`;
      }
      statusEl.className = "status error";
      currentWeatherEl.innerHTML = "";
      forecastEl.innerHTML = "";
      return;
    }

    if (!forecastRes.ok) {
      statusEl.textContent = `Error loading forecast: ${forecastRes.status}`;
      statusEl.className = "status error";
      return;
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    renderCurrentWeather(currentData);
    renderForecast(forecastData);

    statusEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
    statusEl.className = "status";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Network error. Please try again.";
    statusEl.className = "status error";
  }
}

// Events
searchBtn.addEventListener("click", () => {
  fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    fetchWeather(cityInput.value.trim());
  }
});

// Optional: default city when page loads
// fetchWeather("Mumbai");
