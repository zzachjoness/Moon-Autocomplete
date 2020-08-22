//Alpha Vantage Variables
const key = "E6CK6RSNRNB6UH9U";
const url =
  "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=BA&apikey=demo";
const urlSearch =
  "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=";
const urlCompanyOverview =
  "https://www.alphavantage.co/query?function=OVERVIEW&symbol=";
const dailyStockTimeSeries =
  "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
const weeklyStockTimeSeries =
  "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=";
const monthlyStockTimeSeries =
  "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=";

//Set Global Variables
const search = document.querySelector(".search-bar");
const returnDisplay = document.querySelector(".return-display");
const body = document.querySelector(".container");
const overlay = document.querySelector(".overlay");
const overlayExit = document.querySelector(".overlay-exit");
const xs = [];
const ys = [];
var chartSelection = "";
var chartLabel = "";

//Handle SearchBar User Input & Fetch API Data
search.addEventListener("input", async function (evt) {
  const responseUserInput = await fetch(
    `${urlSearch}${this.value}&apikey=${key}`
  );
  var matchesUserInput = await responseUserInput.json();

  if (this.value === "") {
    matchesUserInput = [];
    returnDisplay.innerHTML = "";
  }
  outputHtml(matchesUserInput.bestMatches);
});

//Display Search results from User Input
const outputHtml = (matches) => {
  if (Array.isArray(matches) && matches.length) {
    const html = matches
      .map(
        (match) =>
          `<div 
            class="return-card" 
            id="${match["1. symbol"]}" 
            onclick="getCompanyOverview(this), buildChart(this)"}>
            <h1>[${match["1. symbol"]}]</h1><p>${match["2. name"]}</p>
          </div>`
      )
      .join("");
    returnDisplay.innerHTML = html;
  }
};

/*Handle User Selection of Search Output & Fetch API Data
  getCompanyOverview onclick listener found in outputHtml function*/
async function getCompanyOverview(stock) {
  const response = await fetch(
    `${urlCompanyOverview}${stock.id}&apikey=${key}`
  );
  const data = await response.json();
  awakeOverlay(data);
}

//Display Information Regarding User Selected Search Output & User Selected Chart
const awakeOverlay = (data) => {
  const html = `<div class="overlay-exit" onclick="closeOverlay()">X</div>
    <div class="overlay-title-box">
      <h1>${data.Name}</h1>
      <h2>[${data.Symbol}]</h2>
      <p>${data.Description}</p>
    </div>
    <div class="overlay-chart">
      <canvas class="width" id="chart" height="400"></canvas>
    </div>
    <div class="overlay-chart-buttons">
      <button name="dailyStockTimeSeries" id="${data.Symbol}" class="overlay-chart-buttons-daily" onclick="buildChart(this)">Daily</button>
      <button name="weeklyStockTimeSeries" id="${data.Symbol}" class="overlay-chart-buttons-weekly" onclick="buildChart(this)">Weekly</button>
      <button name="monthlyStockTimeSeries" id="${data.Symbol}" class="overlay-chart-buttons-monthly" onclick="buildChart(this)">Monthly</button>
    </div>`;
  overlay.innerHTML = html;
  overlay.className = "overlay-card width";
  returnDisplay.style.display = "none";
};

//Fetch & Organize StockTimeSeries data for utilization in chart
async function getChartData(stock) {
  let i;
  if (stock.name === "monthlyStockTimeSeries") {
    chartSelection = monthlyStockTimeSeries;
    chartLabel = "Monthly Close Price";
    i = 500;
  } else if (stock.name === "weeklyStockTimeSeries") {
    chartSelection = weeklyStockTimeSeries;
    chartLabel = "Weekly Close Price";
    i = 500;
  } else {
    chartSelection = dailyStockTimeSeries;
    chartLabel = "Daily Close Price";
    i = 100;
  }
  xs.length = 0;
  ys.length = 0;
  const response = await fetch(
    `${chartSelection}${stock.id}&apikey=${key}&datatype=csv`
  );
  const data = await response.text();
  const table = data.split("\n").slice(1, i);
  table.forEach((row) => {
    const column = row.split(",");
    const date = column[0];
    xs.push(date);
    const closePrice = column[4];
    ys.push(closePrice);
  });
  return { xs, ys };
}

//Chart.js Design
async function buildChart(stock) {
  await getChartData(stock);
  const ctx = document.getElementById("chart");
  Chart.defaults.global.defaultFontColor = "#cad2c5";
  const chart = new Chart(ctx, {
    type: "line",
    label: chartLabel,
    data: {
      labels: xs.reverse(),
      datasets: [
        {
          label: chartLabel,
          data: ys.reverse(),
          fill: false,
          borderColor: "#84a98c",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (value) {
                return "$" + value;
              },
            },
          },
        ],
      },
    },
  });
}

//Close Overlay that Displays User Selected Search Output
const closeOverlay = () => {
  overlay.className = "overlay width";
  returnDisplay.style.display = "";
};
