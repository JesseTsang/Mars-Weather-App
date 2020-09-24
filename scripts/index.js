const API_KEY = "DEMO_KEY";
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;

const previousWeatherToggle = document.querySelector(".show-previous-weather");
const previousWeather = document.querySelector(".previous-weather");

// Selectors for update current sol values
const currentSolElement = document.querySelector("[data-current-sol]");
const currentDateElement = document.querySelector("[data-current-date]");
const currentTempHighElement = document.querySelector("[data-current-temp-high]");
const currentTempLowElement = document.querySelector("[data-current-temp-low]");
const windSpeedElement = document.querySelector("[data-current-windSpeed]");
const windDirectionCardinalElement = document.querySelector("[data-current-windDirectionCardinal]");
const windDirectionDegreesElement = document.querySelector("[data-current-windDirectionDegrees]");

// Selectors for updating previous sol template
const previousSolTemplate = document.querySelector("[data-previous-sols-template]");
const previousSolContainer = document.querySelector("[data-previous-sols]");

const unitToggle = document.querySelector("[data-unit-toggle]");
const metricRadio = document.getElementById("cel");
const imperialRadio = document.getElementById("fah");

// Listener to toggle the bottom hidden panel
previousWeatherToggle.addEventListener("click", () => {
  previousWeather.classList.toggle("show-weather");
});

displayCurrentSol();

// This functions retrieves the sols data from NASA API then extract the latest sol info and display it
function displayCurrentSol() {
  // Using the "solData", we extract the last key-value pair, because that would be the latest sol
  getNASAWeather().then((sols) => {
    renderPage(sols);

    // Temperature toggle listener
    unitToggle.addEventListener("click", () => {
      let metricUnits = !isMetric();
      metricRadio.checked = metricUnits;
      imperialRadio.checked = !metricUnits;

      renderPage(sols);
    });

    // Metric radio button event listener
    metricRadio.addEventListener("change", () => {
      renderPage(sols);
    });

    // Imperial radio button event listener
    imperialRadio.addEventListener("change", () => {
      renderPage(sols);
    });
  });
}

function renderPage(sols) {
  let latestSolIndex = sols.length - 1;

  displaySolDetails(sols[latestSolIndex]);
  displayPreviousSols(sols);
  updateUnits();
}

// Fetch and extra sols data from NASA API
async function getNASAWeather() {
  const res = await fetch(API_URL);
  const data = await res.json();
  // The JSON (data) contains the followings key-value pairs:
  //    * Past 7 sols data, keys are their sol numbers, values are readings related to that sol
  //    * sol_keys: [], an array of the sol numbers, size 7
  //    * validity_checks, key-value pairs that contains info to validate the 7 sols keys' values

  // solData contains all 7 sols' data
  const { sol_keys, validity_checks, ...solData } = data;

  return Object.entries(solData).map(([sol, data_2]) => {
    return {
      sol: sol,
      maxTemp: data_2.AT.mx,
      minTemp: data_2.AT.mn,
      windSpeed: data_2.HWS.av,
      windDirectionDegrees: data_2.WD.most_common.compass_degrees,
      windDirectionCardinal: data_2.WD.most_common.compass_point,
      date: new Date(data_2.First_UTC),
    };
  });
}

// This function updates detailed sol info to the main info panel
function displaySolDetails(sols) {
  currentSolElement.innerText = sols.sol;
  currentDateElement.innerText = displayDate(sols.date);
  currentTempHighElement.innerText = displayTemperature(sols.maxTemp);
  currentTempLowElement.innerText = displayTemperature(sols.minTemp);
  windSpeedElement.innerText = displaySpeed(sols.windSpeed);
  windDirectionCardinalElement.innerText = sols.windDirectionCardinal;
  windDirectionDegreesElement.style.setProperty("--direction", `${sols.windDirectionDegrees}deg`);
}

// Helper function to convert a Date object to a simple "September 31st" format.
function displayDate(date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

function displayTemperature(temperature) {
  let returnTemperature = temperature;

  if (!isMetric()) {
    returnTemperature = (temperature - 32) * (5 / 9);
  }

  return Math.round(returnTemperature);
}

function displaySpeed(speed) {
  let returnSpeed = speed;

  if (!isMetric()) {
    returnSpeed = speed / 1.609;
  }

  return Math.round(returnSpeed);
}

function displayPreviousSols(sols) {
  previousSolContainer.innerText = "";

  sols.forEach((solData, index) => {
    // Deep copy a template from "data-previous-sols-template"
    const solContainer = previousSolTemplate.content.cloneNode(true);

    // Update a previous sol data
    solContainer.querySelector("[data-previous-sol]").innerText = solData.sol;
    solContainer.querySelector("[data-previous-date]").innerText = displayDate(solData.date);
    solContainer.querySelector("[data-previous-temp-high]").innerText = displayTemperature(solData.maxTemp);
    solContainer.querySelector("[data-previous-temp-low]").innerText = displayTemperature(solData.minTemp);

    // Add a listener for the "more info"
    solContainer.querySelector("[data-select-button]").addEventListener("click", () => {
      displaySolDetails(solData);
    });

    // Update the selector "data-previous-sols"
    previousSolContainer.appendChild(solContainer);
  });
}

function updateUnits() {
  const speedUnits = document.querySelectorAll("[data-speed-unit]");
  const temperatureUnit = document.querySelectorAll("[data-temperature-unit]");

  speedUnits.forEach((unit) => {
    unit.innerText = isMetric() ? "kph" : "mph";
  });

  temperatureUnit.forEach((unit) => {
    unit.innerText = isMetric() ? "C" : "F";
  });
}

function isMetric() {
  return metricRadio.checked;
}
