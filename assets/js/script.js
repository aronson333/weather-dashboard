var cityInputEl = document.querySelector('#city');
var cityFormEl = document.querySelector('#city-form');
var citiesEl = document.querySelector('#cities');
var forecastContainer = document.querySelector('#forecast-container')

var weatherApi = "https://api.openweathermap.org/data/2.5/forecast"
var locationApi = "https://api.openweathermap.org/geo/1.0/direct"
var API_KEY = '2d95c15461ad10aa37963ba3dd60af0f'
var searchedCities = localStorage.getItem('cities') || []

function getWeather(city) {
  cityToLocation(city).then(location => {
    var apiUrl = `${weatherApi}?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${API_KEY}`
    fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .then(function (data) {
      displayForecast(data)
    })
    .catch(function (error) {
      alert('Unable to get weather');
      console.log(error)
    });
  })
}

// https://openweathermap.org/api/geocoding-api#direct_name
function cityToLocation(city) {
  var countryCode = 'USA'
  var apiUrl = `${locationApi}?q=${city},${countryCode}&limit=1&appid=${API_KEY}`

  return fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        console.log(response);
        return response.json()
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .then(function (data) {
      return { lat: data[0].lat, lon: data[0].lon }
    })
    .catch(function (error) {
      alert('Unable to get location');
      console.log(error)
    });
}

var formSubmitHandler = function (event) {
  event.preventDefault();

  var city = cityInputEl.value.trim();

  if (city) {
    getWeather(city);
    searchedCities.push(city)
    localStorage.setItem('cities', JSON.stringify(searchedCities))
    displayCity(city)
    cityInputEl.value = '';
  } else {
    alert('Please enter a city name');
  }
};

var buttonClickHandler = function (event) {
  var city = event.target.getAttribute('data-city');

  if (city) {
    getWeather(city)
  }
}

function displayCity(city) {
  var cityButton = document.createElement('button')
  cityButton.setAttribute('data-city', city)
  cityButton.textContent = city
  cityButton.classList.add('btn')
  citiesEl.appendChild(cityButton)
}

function displayForecast(data) {
  var citySearchTermEl = document.querySelector('#city-search-term')
  var iconEl = document.querySelector('#icon')
  var currentForecast = data.list[0]
  var date = currentForecast.dt_txt.split(' ')[0]
  // set the temperature, weather and humidity
  document.querySelector('#current-temp').textContent = currentForecast.main.temp + ' °F'
  document.querySelector('#current-humidity').textContent = currentForecast.main.humidity + ' %'
  document.querySelector('#current-wind').textContent = currentForecast.wind.speed + ' MPH'
  citySearchTermEl.textContent = `${data.city.name} ${date}`
  iconEl.setAttribute('src', `http://openweathermap.org/img/wn/${currentForecast.weather[0].icon}.png`)
  iconEl.setAttribute('alt', currentForecast.weather[0].main)
  console.log('displaying forecast',data)

  for (var i = 1; i < 5; i++) {
    var forecast = data.list[i * 7]
    var date = forecast.dt_txt.split(' ')[0]
    forecastContainer.innerHTML += `
    <div id="day-${i}" class="card">
      <h3>${date}</h3>
      <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].main}">
      <ul>
        <li>Temp: ${forecast.main.temp} °F</li>
        <li>Wind: ${forecast.wind.speed} MPH</li>
        <li>Humidity: ${forecast.main.humidity}%</li>
      </ul>
    </div>
    `
  }

}

function init() {
  var citiesString = localStorage.getItem('cities') || '[]'
  searchedCities = JSON.parse(citiesString)
  searchedCities.forEach(displayCity)
}

window.onload = init
cityFormEl.addEventListener('submit', formSubmitHandler)
citiesEl.addEventListener('click', buttonClickHandler)
