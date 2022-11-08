const API_BASE = 'https://api.squiggle.com.au';
const API_TEAMS_ENDPOINT = `${API_BASE}/?q=teams`;
const API_GAMES_ENDPOINT = `${API_BASE}/?q=games`;
const IMAGE_BASE = 'https://squiggle.com.au';

const app = document.getElementById('app');

const dataSort = document.getElementById("data-sort");
const dataFilter = document.getElementById("data-filter");

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

async function getData() {
  const teamData = await queryEndpoint(API_TEAMS_ENDPOINT);
  const games2021Data = await queryEndpoint(`${API_GAMES_ENDPOINT};year=2021`);
  const games2022Data = await queryEndpoint(`${API_GAMES_ENDPOINT};year=2022`);
  for (const team of teamData.teams) {
    team.games = {
      "2021": games2021Data.games.filter(game => {
        return game.ateamid === team.id || game.hteamid === team.id;
      }),
      "2022": games2022Data.games.filter(game => {
        return game.ateamid === team.id || game.hteamid === team.id;
      })
    }
  }
  return teamData;
}

async function renderUI(data) {

  clearUI();

  const { teams } = data;
  const recordTemplate = document.getElementById("data-record-template");
  const statsTemplate = document.getElementById("data-record-stats-template");
  for (const team of teams) {

    console.log(team);

    const recordClone = recordTemplate.content.firstElementChild.cloneNode(true);

    const heading = recordClone.querySelector("h2");
    const logo = recordClone.querySelector("img");
    const introText = recordClone.querySelector("p");
    const statsTable = recordClone.querySelector("tbody");

    logo.src = `${IMAGE_BASE}${team.logo}`;
    heading.innerHTML = team.name;
    introText.innerHTML = `Debuted in ${team.debut}`;

    // notice reverse here
    for (const [year, games] of Object.entries(team.games).reverse()) {

      const statsTemplateClone = statsTemplate.content.firstElementChild.cloneNode(true);
      const statsCells = statsTemplateClone.querySelectorAll("td");

      const played = games.length;
      const won = games.reduce((curr, next) => {
        return next.winnerteamid === team.id ? curr + 1 : curr + 0;
      }, 0);
      const lost = games.reduce((curr, next) => {
        return next.winnerteamid === team.id ? curr + 0 : curr + 1;
      }, 0);
      statsCells[0].innerHTML = year;
      statsCells[1].innerHTML = played;
      statsCells[2].innerHTML = won;
      statsCells[3].innerHTML = lost;

      statsTable.appendChild(statsTemplateClone);

    }


    app.appendChild(recordClone);

  }
}

function clearUI() {
  while (app.firstChild) {
    app.removeChild(app.firstChild);
  }
}

function filterData(data, key) {
  data.teams = data.teams.filter((team) => {
    if (key === "-") {
      return team;
    } else {
      return key === "pre-1980" ? team.debut < 1980 : team.debut > 1980;
    }
  });
  return data;
}

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

const data = await getData();

// here we actually initialize our UI
await renderUI(data);

// here we register event listeners to update
// ui and data based on interactions
dataSort.addEventListener("change", async (e) => {

  console.log("Data Sort Change");
  console.log(e.target.value);

  const sortedData = sortData(data, e.target.value);

  clearUI();
  await renderUI(sortedData);
})

dataFilter.addEventListener("change", async (e) => {
  console.log("Data Filter Change");
  console.log(e.target.value);
  // note that filtering stops to work as we expect after we filter once
  // why is that, and what can we do differently?
  // even when we solve this by reloading, notice that the existing sort wont apply
  const filteredData = filterData(data, e.target.value);

  clearUI();
  await renderUI(filteredData);
})
