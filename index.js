const API_BASE = 'https://api.squiggle.com.au';
const API_TEAMS_ENDPOINT = `${API_BASE}/?q=teams`;
const API_GAMES_ENDPOINT = `${API_BASE}/?q=games`;
const IMAGE_BASE = 'https://squiggle.com.au';

// Here we select to part of the HTML where we will put all our generated HTML
const app = document.getElementById('app');

// Here we select our HTML select box for sorting our data
const dataSort = document.getElementById("data-sort");

// Then, we register an event listener on our data sorting select box, using the "change" event
// Notice addEventListener takes two arguments, the name of the event ("change")
// and a callback function, which is run every time this event is triggered
dataSort.addEventListener("change", async (event) => {
  console.log("Data Sort Change");
  console.log(event.target.value);

  // we are rebuilding the display of our app here with the next lines of code:
  // 1. We are re-fetching data from our API (it is possible to skip this step, but we are being safe that we display exactly the right information)
  const data = await getData();
  // 2. We run our function which sorts the data based on the value in our select element (event.target.value)
  const sortedData = sortData(data, event.target.value);
  // 3. We re-render our app with the sorted data
  await renderUI(sortedData);
})

// Here we select our HTML select box for filtering our data
const dataFilter = document.getElementById("data-filter");

// Then, we register an event listener on our data filtering select box, using the "change" event
// Notice addEventListener takes two arguments, the name of the event ("change")
// and a callback function, which is run every time this event is triggered
dataFilter.addEventListener("change", async (event) => {
  console.log("Data Filter Change");
  console.log(event.target.value);

  // we are rebuilding the display of our app here with the next lines of code:
  // 1. We are re-fetching data from our API
  const data = await getData();
  // 2. We run our function which filters the data based on the value in our select element (event.target.value)
  const filteredData = filterData(data, event.target.value);
  // 3. We re-render our app with the filtered data
  await renderUI(filteredData);
})

// this is a helper function that wraps fetch for GET requests, and handles errors
async function queryEndpoint(endpoint) {
  let data = null;
  try {
    const response = await fetch(endpoint);
    console.log(response);
    if (response.status === 200) {
      data = await response.json();
    }
  } catch (error) {
    console.log('api error');
    console.error(error);
  }
  return data;
}

// this is the function we build our data in.
// For the data we want from this API, we need to query three different API endpoints
// and then merge some of that data together on each "team" object (I'm getting data on football teams)
async function getData() {
  const teamData = await queryEndpoint(API_TEAMS_ENDPOINT);
  const games2021Data = await queryEndpoint(`${API_GAMES_ENDPOINT};year=2021`);
  const games2022Data = await queryEndpoint(`${API_GAMES_ENDPOINT};year=2022`);

  // looping over the team data, from the first API endpoint
  for (const team of teamData.teams) {
    // for each team, attaching game data for the years I got game data from the other API data I fetched
    team.games = {
      "2021": games2021Data.games.filter(game => {
        return game.ateamid === team.id || game.hteamid === team.id;
      }),
      "2022": games2022Data.games.filter(game => {
        return game.ateamid === team.id || game.hteamid === team.id;
      })
    }
  }
  // After we joined together the data we want from the different endpoints, we return our data
  return teamData;
}

// this is a function we wrote to contain all of our UI rendering code
async function renderUI(data) {
  // For each time we call this function, clear existing elements, so we render on a "clean slate"
  clearUI();

  // data.teams contains an array of our team data, we get teams out of data using destructuring assignment
  const { teams } = data;

  // We have two templates in our HTML document, here we select them, so we can make clones of them later
  // as we loop over our teams
  const recordTemplate = document.getElementById("data-record-template");
  const statsTemplate = document.getElementById("data-record-stats-template");

  // This is where most of the work happens
  // we loop over our teams and build an HTML structure (a "card" as we called it in our mock) for each team
  for (const team of teams) {

    console.log(team);

    // For each team, get a clone of our primary template
    const recordClone = recordTemplate.content.firstElementChild.cloneNode(true);

    // select the elements in our cloned HTML element where we want to put data
    const heading = recordClone.querySelector("h2");
    const logo = recordClone.querySelector("img");
    const introText = recordClone.querySelector("p");
    const statsTable = recordClone.querySelector("tbody");

    // Add the logo URL to the image tag
    logo.src = `${IMAGE_BASE}${team.logo}`;
    // Add texts to the heading and text section
    heading.innerHTML = team.name;
    introText.innerHTML = `Debuted in ${team.debut}`;

    // Now, for each team, we have another loop over the games
    // So that we can create a table row for each game
    // See here we use Object.entries() to loop over an Object
    // See here we also use destructuring assignment "const [year, games]"
    for (const [year, games] of Object.entries(team.games).reverse()) {

      // For each year, get a clone of our stats template
      const statsTemplateClone = statsTemplate.content.firstElementChild.cloneNode(true);

      // select the table cells in our template
      // Notice querySelectorAll which gives us an Array of matching HTML elements
      const statsCells = statsTemplateClone.querySelectorAll("td");

      // Building the stats data we want to display for each year
      const played = games.length;
      const won = games.reduce((curr, next) => {
        return next.winnerteamid === team.id ? curr + 1 : curr + 0;
      }, 0);
      const lost = games.reduce((curr, next) => {
        return next.winnerteamid === team.id ? curr + 0 : curr + 1;
      }, 0);

      // Attaching the stats data to cells
      statsCells[0].innerHTML = year;
      statsCells[1].innerHTML = played;
      statsCells[2].innerHTML = won;
      statsCells[3].innerHTML = lost;

      // Attaching our new HTML element to the table in our primary template
      statsTable.appendChild(statsTemplateClone);

    }

    // Attaching our "card" for this team to the app HTML element
    app.appendChild(recordClone);

  }
}

// Helper function to clear our app UI
function clearUI() {
  // This looks into app and removes its children until app is empty of children
  while (app.firstChild) {
    app.removeChild(app.firstChild);
  }
}

// Our function to filter the data based on the user selection
// See the HTML select element for the filter - there are three possible values, which in this function are the "key"
// 1. "-", 2. "pre-1980", 3. "post-1980"
function filterData(data, key) {
  data.teams = data.teams.filter((team) => {
    if (key === "-") {
      return team;
    } else {
      // Notice this conditional statement syntax, you will see it alot
      // Read about it here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
      return key === "pre-1980" ? team.debut < 1980 : team.debut > 1980;
    }
  });
  return data;
}

// Our function to sort the data based on the user selection
// See the HTML select element for the sort - there are two possible values, which in this function are the "key"
// 1. "a-z", 2. "z-a"
function sortData(data, key) {
  data.teams = data.teams.sort((a, b) => {
    if (a.name > b.name) {
      return key === "a-z" ? 1 : -1;
    }
    if (a.name < b.name) {
      return key === "a-z" ? -1 : 1;
    }
    return 0;
  })
  return data;
}

// Below are functions we are calling as this JavaScript module loads, so, essentially when the page loads

// Get our initial data
const data = await getData();

// initialize our UI with the initial data
await renderUI(data);
