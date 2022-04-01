// ___________________DOM functions___________________
// general-info:
let locationName = document.querySelector(".city-name");
let weatherTemp = document.querySelector(".weather-temp");
let weatherDescription = document.querySelector(".weather-description");

// details-info:
let realFeel = document.querySelector("#real-feel-value");
let humidity = document.querySelector("#humidity-value");
let chanceOfRain = document.querySelector("#chance-of-rain-value");
let pressure = document.querySelector("#pressure-value");
let windSpeed = document.querySelector("#wind-speed-value");

// date and time:
let realDate = document.querySelector(".date");
let realTime = document.querySelector(".time");
// forcast-daily

const showTime = (() => {
  const d = new Date();
  realDate.textContent = d.toDateString();
  realTime.textContent = d.getHours() + ":" + d.getMinutes();
})();

defaultCity = "Tehran";

function buildRequestCoordsUrl(cityName, units) {
  return `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${units}&APPID=a75ded162450fba9e6df60158d6fff9c`;
}

async function getWeatherdData(cityName) {
  units = "metric";
  const requestCoordsUrl = buildRequestCoordsUrl(cityName, units);

  // ______get coords______
  const getCoords = async (url) => {
    const response = await fetch(url, {
      mode: "cors",
    });

    if (response.status !== 200) {
      throw new Error("Error msg: can not fetch the Coords' data");
    }
    const weatherData = await response.json();
    return weatherData;
  };

  getCoords(requestCoordsUrl)
    .then((data) => {
      // ___Show general Info___

      if (units === "metric") {
        tempUnit = "°C";
      } else if (units === "imperial") {
        tempUnit = "°F";
      }
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      locationName.textContent = capitalizeFirstLetter(data.name);
      weatherTemp.textContent = `${Math.round(data.main.temp)}` + tempUnit;
      weatherDescription.textContent = capitalizeFirstLetter(
        data.weather[0].description
      );

      // ___Details info___
      realFeel.textContent = `${Math.round(data.main.feels_like)}` + tempUnit;
      humidity.textContent = `${data.main.humidity}%`;
      windSpeed.textContent = `${(data.wind.speed *= 3.6).toFixed(1)}km/h`;
      pressure.textContent = `${data.main.pressure}mbar`;

      // _____________________________________
      // to get Forcast request I using that current-request's coodinates(lon&lat)
      let coordLon = data.coord.lon;
      let coordLat = data.coord.lat;
      const requestForecastUrl = buildRequestForecastUrl(
        coordLat,
        coordLon,
        units
      );
      function buildRequestForecastUrl(coordLat, coordLon, units) {
        return `https://api.openweathermap.org/data/2.5/onecall?lat=${coordLat}&lon=${coordLon}&exclude=minutely,alerts&units=${units}&appid=a75ded162450fba9e6df60158d6fff9c`;
      }
      async function getForecast(url) {
        const response = await fetch(url, {
          mode: "cors",
        });
        if (response.status !== 200) {
          throw new Error("Error msg: can not fetch the Forcast's data");
        }
        const forecastData = await response.json();
        return forecastData;
      }
      getForecast(requestForecastUrl)
        .then((data) => {
          chanceOfRain.textContent = `${Math.round(data.daily[0].pop)}%`;

          // ___Daily FORCAST___

          for (let i = 0; i < 7; i++) {
            let dailyTempMax = document.querySelector(
              `[data-daily='${i}-temp-min']`
            );
            dailyTempMax.textContent =
              Math.round(data.daily[i].temp.max) + tempUnit;

            let dailyTempMin = document.querySelector(
              `[data-daily='${i}-temp-max']`
            );
            dailyTempMin.textContent =
              Math.round(data.daily[i].temp.min) + tempUnit;

            let dailyForecastIcon = document.querySelector(
              `[data-daily='${i}-forecast-icon']`
            );
            dailyIcon = data.daily[i].weather[0].icon;
            dailyForecastIcon.src = `http://openweathermap.org/img/wn/${dailyIcon}@2x.png`;

            let dayName = document.querySelector(
              `[data-daily='${i}-day-of-week']`
            );
            const getdayOfWeek = () => {
              let days = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ];
              let d = new Date();
              dayNumber = d.getDay() + i;
              return days[dayNumber % 7];
            };
            dayName.textContent = getdayOfWeek();
          }

          // ___HOURLY FORECAST ___
          for (let i = 0; i < 24; i++) {
            let showCorrectHour = document.querySelector(
              `[data-hourly='date-hour-${i}']`
            );
            const getHour = () => {
              let d = new Date();
              let presentHour = d.getHours();
              let hour = presentHour + i;
              return hour % 24;
            };
            showCorrectHour.textContent = getHour();

            let hourlyForecastTemp = document.querySelector(
              `[data-hourly='temp-hour-${i}']`
            );
            hourlyForecastTemp.textContent =
              parseInt(data.hourly[i].temp) + tempUnit;

            let hourlyForecastIcon = document.querySelector(
              `[data-hourly='icon-hour-${i}']`
            );
            hourlyIcon = data.hourly[i].weather[0].icon;
            hourlyForecastIcon.src = `http://openweathermap.org/img/wn/${hourlyIcon}@2x.png`;
          }
        })
        .catch((err) => console.log("rejected:", err.message));
    })

    .catch((err) => console.log("rejected:", err.message));
}

//___Handel Forecast's Slider___
document
  .querySelector("#search-box-input")
  .addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      let cityName = ev.target.value;
      getWeatherdData(cityName);
      ev.target.value = "";
    }
  });
getWeatherdData(defaultCity);
let dailyButton = document.querySelector("#daily-button");
let hourlyButton = document.querySelector("#hourly-button");
let pageNumber = 0;
dailyButton.addEventListener("click", (e) => {
  e.target.classList.remove("border-gray-200");
  e.target.classList.add("bg-black");
  hourlyButton.classList.remove("bg-black");
  hourlyButton.classList.add("border-gray-200");
  document.querySelector("#previous-button").classList.add("hidden");
  document.querySelector("#next-button").classList.add("hidden");
  pageNumber = 0;
  sliderHandeler();
});

hourlyButton.addEventListener("click", (e) => {
  document.querySelector(".hourly").classList.add("w-11/12");
  e.target.classList.remove("border-gray-200");
  e.target.classList.add("bg-black");
  dailyButton.classList.remove("bg-black");
  dailyButton.classList.add("border-gray-200");
  document.querySelector("#previous-button").classList.remove("hidden");
  document.querySelector("#next-button").classList.remove("hidden");
  pageNumber = 1;
  sliderHandeler();
});

document.querySelector("#previous-button").addEventListener("click", (e) => {
  if (pageNumber > 1) {
    pageNumber--;
  }
  sliderHandeler();
});
document.querySelector("#next-button").addEventListener("click", (e) => {
  if (pageNumber < 3) {
    pageNumber++;
  }
  sliderHandeler();
});
const sliderHandeler = () => {
  if (pageNumber === 0) {
    document.querySelector(".hourly").classList.remove("w-11/12");
    document.querySelector(".daily").classList.remove("hidden");
    document.querySelector(".hourly-slider-1").classList.add("hidden");
    document.querySelector(".hourly-slider-2").classList.add("hidden");
    document.querySelector(".hourly-slider-3").classList.add("hidden");
  }
  if (pageNumber === 1) {
    document.querySelector(".daily").classList.add("hidden");
    document.querySelector(".hourly-slider-2").classList.add("hidden");
    document.querySelector(".hourly-slider-3").classList.add("hidden");
    document.querySelector(".hourly-slider-1").classList.remove("hidden");
  } else if (pageNumber === 2) {
    document.querySelector(".hourly-slider-1").classList.add("hidden");
    document.querySelector(".hourly-slider-3").classList.add("hidden");
    document.querySelector(".hourly-slider-2").classList.remove("hidden");
  } else if (pageNumber === 3) {
    document.querySelector(".hourly-slider-2").classList.add("hidden");
    document.querySelector(".hourly-slider-3").classList.remove("hidden");
  }
};
