const city = localStorage.getItem('selectedCity');
const container = document.getElementById('weatherContainer');
const apiKey = '5e87693291842b5ecb03e5f44f58a65e';
const forecastMode = localStorage.getItem('forecastMode');

const fetchWeatherData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Місто не знайдено');
    }
    return await response.json();
  } catch (error) {
    container.innerHTML = `<p>Помилка: ${error.message}</p>`;
    throw error;
  }
};

const renderCurrentWeather = (data) => {
  container.innerHTML = `<h2>Поточна погода для ${data.name}, ${data.sys.country}</h2>`;
  container.innerHTML += `
    <div class="current-weather">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" />
      <p>Температура: ${data.main.temp}°C</p>
      <p>Опис: ${data.weather[0].description}</p>
      <p>Вологість: ${data.main.humidity}%</p>
      <p>Швидкість вітру: ${data.wind.speed} м/с</p>
    </div>
  `;
};

const renderForecast = (data) => {
  const days = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) {
      days[date] = [];
    }
    days[date].push(item);
  });

  container.innerHTML = `<h2>5-денний прогноз для ${data.city.name}, ${data.city.country}</h2>`;
  const forecastContainer = document.querySelector('.day-forecast-container');
  forecastContainer.innerHTML = '';

  for (const [date, entries] of Object.entries(days)) {
    const avgTemp = (
      entries.reduce((sum, entry) => sum + entry.main.temp, 0) / entries.length
    ).toFixed(1);

    const description = entries[0].weather[0].description;
    const icon = entries[0].weather[0].icon;

    forecastContainer.innerHTML += `
      <div class="day-forecast">
        <h3>${new Date(date).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
        <p>Середня температура: ${avgTemp}°C</p>
        <p>Опис: ${description}</p>
      </div>
    `;
  }

  renderWeatherChart(days);
};

const renderWeatherChart = (days) => {
  const labels = Object.keys(days).map(date => new Date(date).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' }));
  const temperatures = Object.values(days).map(entries => (
    entries.reduce((sum, entry) => sum + entry.main.temp, 0) / entries.length
  ).toFixed(1));

  const ctx = document.getElementById('weatherChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Середня температура (°C)',
        data: temperatures,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Прогноз погоди на 5 днів'
        }
      }
    }
  });
};

const init = async () => {
  if (forecastMode === 'now') {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ua&appid=${apiKey}`;
    const data = await fetchWeatherData(currentWeatherUrl);
    renderCurrentWeather(data);
  } else {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=ua&appid=${apiKey}`;
    const data = await fetchWeatherData(forecastUrl);
    renderForecast(data);
  }
};

init();