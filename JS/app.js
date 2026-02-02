// ===================== DOM ELEMENTS =====================
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const errorMsg = document.getElementById("errorMsg");
const locationName = document.getElementById("locationName"); // your top location span
const mainCard = document.getElementById("weatherCard"); // main weather card
const unitToggle = document.getElementById("unitToggle"); 
const recentSearchesList = document.getElementById("recentSearches");
// ===================== RECENT SEARCHES DATA =====================
let recentSearches =
  JSON.parse(localStorage.getItem("recentSearches")) || [];
function renderRecentSearches() {
  const searchText = cityInput.value.toLowerCase().trim();
  recentSearchesList.innerHTML = "";

  const filteredCities = recentSearches.filter(city =>
    city.toLowerCase().includes(searchText)
  );

  if (filteredCities.length === 0) {
    recentSearchesList.classList.add("hidden");
    return;
  }

  recentSearchesList.classList.remove("hidden");

  filteredCities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.className =
      "px-4 py-2 cursor-pointer hover:bg-gray-100";

    li.addEventListener("click", () => {
      cityInput.value = city;
      fetchWeatherByCity(city);
      recentSearchesList.classList.add("hidden");
    });

    recentSearchesList.appendChild(li);
  });
}

function addRecentSearch(city) {
  recentSearches = [
    city,
    ...recentSearches.filter(c => c !== city)
  ].slice(0, 5);

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(recentSearches)
  );

  renderRecentSearches();
}

// ===================== TEMPERATURE UNIT TOGGLE ========= ============
unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? "°C" : "°F";

  const mainTempEl = document.getElementById("mainTemp");
  const feelsLikeEl = document.getElementById("feelsLike");
  const feelsLikeHighlight =
    document.getElementById("feelsLikeHighlight");

  if (!mainTempEl || !feelsLikeEl) return;

  if (isCelsius) {
    mainTempEl.textContent = `${Math.round(currentTemps.temp)}°C`;
    feelsLikeEl.textContent =
      `Feels like: ${Math.round(currentTemps.feelsLike)}°C`;

    if (feelsLikeHighlight) {
      feelsLikeHighlight.textContent =
        `${Math.round(currentTemps.feelsLike)} °C`;
    }
  } else {
    mainTempEl.textContent =
      `${Math.round(currentTemps.temp * 9 / 5 + 32)}°F`;
    feelsLikeEl.textContent =
      `Feels like: ${Math.round(currentTemps.feelsLike * 9 / 5 + 32)}°F`;

    if (feelsLikeHighlight) {
      feelsLikeHighlight.textContent =
        `${Math.round(currentTemps.feelsLike * 9 / 5 + 32)} °F`;
    }
  }
});
// ===================== LAST UPDATED ELEMENT =====================
const lastUpdated = document.createElement("p");
lastUpdated.id = "lastUpdated";
lastUpdated.className = "text-white mt-2 text-sm";
function updateLastUpdated() {
  const now = new Date();
  lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// ===================== UTILITY FUNCTION =====================
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
  setTimeout(() => {
    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";
  }, 3000);
}
// Format Unix timestamp to HH:MM(like hours and minutes)
function formatTime(unixTime) {
  return new Date(unixTime * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Check if current time is between sunrise and sunset
function isDayTime(sunriseUnix, sunsetUnix) {
  const now = new Date().getTime() / 1000; // current timestamp in seconds
  return now >= sunriseUnix && now < sunsetUnix;
}

// ===================== FETCH WEATHER FUNCTIONS =====================
const API_KEY = "70cf6fa8fe641664f06fc51ec5c60230";

async function fetchWeatherByCity(city) {
  try {
    toggleLoading(true);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    updateDashboard(data);

    fetchFiveDayForecast(city); //

    localStorage.setItem("lastCity", city);
  } catch (err) {
    showError(err.message);
  } finally {
    toggleLoading(false);
  }
}
// ===================== FETCH WEATHER BY COORDINATES =====================
async function fetchWeatherByCoords(lat, lon) {
  try {
    toggleLoading(true);
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    if (!res.ok) throw new Error("Unable to fetch weather");
    const data = await res.json();
    updateDashboard(data);
  } catch (err) {
    showError(err.message);
  } finally {
    toggleLoading(false);
  }
}
// ===================== FETCH 5 DAY FORECAST =====================
async function fetchFiveDayForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Forecast not available");

    const data = await res.json();
    renderFiveDayForecast(data.list);
  } catch (err) {
    showError(err.message);
  }
}

// ===================== GET BACKGROUND BASED ON WEATHER =====================
function getWeatherBg(condition) {
  switch (condition) {
    case "Clear":
      return "from-sky-400 to-blue-500";
    case "Clouds":
      return "from-gray-400 to-gray-600";
    case "Rain":
    case "Drizzle":
      return "from-blue-700 to-slate-900";
    case "Thunderstorm":
      return "from-purple-700 to-gray-900";
    case "Snow":
      return "from-cyan-200 to-blue-300";
    default:
      return "from-sky-400 to-blue-500";
  }
}
// ===================== CURRENT TEMPERATURES =====================
let currentTemps = {
  temp: 0,
  feelsLike: 0
};

// ===================== HIGHLIGHT CARD TEMPLATE =====================
function highlightCard(icon, label, value) {
  return `
    <div class="flex flex-col items-center justify-center h-full gap-2 
            transition hover:scale-105">
      <i class="${icon} text-2xl text-blue-600"></i>
      <p class="text-sm text-gray-500">${label}</p>
      <p class="text-lg font-semibold">${value}</p>
    </div>
  `;
}
// ===================== UPDATE DASHBOARD =====================
function updateDashboard(data) {
  locationName.textContent = `${data.name}, ${data.sys.country}`;
 const weatherType = data.weather[0].main;
const bgClass = getWeatherBg(weatherType);
currentTemps.temp = data.main.temp;
currentTemps.feelsLike = data.main.feels_like;
mainCard.innerHTML = `
  <div class="flex flex-col sm:flex-row items-center justify-between p-6 h-full 
              bg-gradient-to-r ${bgClass} rounded-2xl transition-all duration-500">
    <div class="text-white">
      <h1 class="text-4xl font-bold" id="mainTemp">
        ${Math.round(currentTemps.temp)}°C
      </h1>

      <p class="capitalize">${data.weather[0].description}</p>

      <p id="feelsLike">
        Feels like: ${Math.round(currentTemps.feelsLike)}°C
      </p>
    </div>

    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
         alt="weather"
         class="w-32 h-32"/>
  </div>
`;
  mainCard.appendChild(lastUpdated);
  updateLastUpdated();
// ===================== ADDITIONAL DETAILS =====================
const safeSet = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

safeSet("pressure", `${data.main.pressure} hPa`);
safeSet("humidity", `${data.main.humidity} %`);
safeSet("clouds", `${data.clouds.all} %`);
safeSet("wind", `${data.wind.speed} m/s`);
safeSet("visibility", `${(data.visibility / 1000).toFixed(1)} km`);
safeSet("feelsLikeHighlight", `${Math.round(data.main.feels_like)} °C`);
safeSet("sunriseTime", formatTime(data.sys.sunrise));
safeSet("sunsetTime", formatTime(data.sys.sunset));
// ===================== PAGE BACKGROUND (DAY/NIGHT) =====================
if (isDayTime(data.sys.sunrise, data.sys.sunset)) {
  document.body.classList.remove("night");
  document.body.classList.add("day");
} else {
  document.body.classList.remove("day");
  document.body.classList.add("night");
}


// Smooth transition for background
document.body.style.transition = "background 1s ease-in-out";
}
// ===================== RENDER 5 DAY FORECAST =====================
function renderFiveDayForecast(list) {
  const container = document.getElementById("forecastContainer");
  if (!container) return;

  container.innerHTML = "";

  const dailyForecasts = list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyForecasts.slice(0, 5).forEach(day => {
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric"
    });

    const card = document.createElement("div");
   card.className = `
   min-w-[220px] bg-white/80 rounded-2xl shadow-md p-6
   flex flex-col items-center gap-3
   transition hover:scale-105 hover:bg-blue-50
   backdrop-blur-md
   animate-fade-in
`;
    card.innerHTML = `
      <p class="text-gray-600 font-semibold">${date}</p>

      <img
        src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
        class="w-16 h-16"
        alt="icon"
      />

      <p class="text-2xl font-bold text-gray-800">
        ${Math.round(day.main.temp)}°C
      </p>

      <div class="flex flex-col gap-1 text-sm text-gray-500 text-center">
        <p>💨 ${day.wind.speed} m/s</p>
        <p>💧 ${day.main.humidity}%</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// ===================== LOADING STATE =====================
function toggleLoading(isLoading) {
  if (isLoading) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    locationBtn.disabled = true;
  } else {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass text-gray-500"></i>';
    locationBtn.disabled = false;
  }
}

// ===================== EVENT LISTENERS =====================
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  fetchWeatherByCity(city);
  addRecentSearch(city);
});
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    () => showError("Location access denied")
  );
});

// ===================== INITIAL WEATHER =====================
// Optional: load default weather (e.g., London) on page load
const savedCity = localStorage.getItem("lastCity");

if (savedCity) {
  fetchWeatherByCity(savedCity);
} else {
  fetchWeatherByCity("London");
}
// ===================== RECENT SEARCHES EVENT LISTENERS =====================

cityInput.addEventListener("focus", renderRecentSearches);

document.addEventListener("click", (e) => {
  if (
    !recentSearchesList.contains(e.target) &&
    e.target !== cityInput
  ) {
    recentSearchesList.classList.add("hidden");
  }
});