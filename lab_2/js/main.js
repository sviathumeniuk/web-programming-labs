document.getElementById('nowBtn').addEventListener('click', function (e) {
  e.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  if (city) {
    localStorage.setItem('selectedCity', city);
    localStorage.setItem('forecastMode', 'now');
    window.location.href = 'forecast.html';
  }
});

document.getElementById('daysBtn').addEventListener('click', function (e) {
  e.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  if (city) {
    localStorage.setItem('selectedCity', city);
    localStorage.setItem('forecastMode', '5days');
    window.location.href = 'forecast.html';
  }
});
