 async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results) throw new Error("City not found");
  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed");
  return res.json();
}

function getIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}

function showCurrent(place, data) {
  const c = data.current;
  document.getElementById("current").innerHTML = `
    <h2>${place.name}, ${place.country}</h2>
    <p style="font-size:3rem">${getIcon(c.weather_code)}</p>
    <p class="temp">${c.temperature_2m}°C</p>
    <p>Humidity: ${c.relative_humidity_2m}%</p>
    <p>Wind: ${c.wind_speed_10m} km/h</p>`;
}

function showForecast(data) {
  const d = data.daily;
  document.getElementById("forecast").innerHTML = d.time.slice(0, 5).map((day, i) => `
    <div class="day">
      <p>${new Date(day).toLocaleDateString("en-GB", { weekday: "short" })}</p>
      <p>${getIcon(d.weather_code[i])}</p>
      <p>${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°</p>
    </div>`).join("");
}

const message = document.getElementById("message");

async function search() {
  const city = document.getElementById("city").value.trim();
  if (!city) return;
  message.textContent = "Loading...";
  try {
    const place = await getCoordinates(city);
    const data = await getWeather(place.latitude, place.longitude);
    showCurrent(place, data);
    showForecast(data);
    message.textContent = "";
  } catch (err) {
    message.textContent = err.message;
  }
}

document.getElementById("searchBtn").addEventListener("click", search);
document.getElementById("city").addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});