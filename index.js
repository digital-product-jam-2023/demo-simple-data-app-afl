const API_BASE = 'https://api.squiggle.com.au';
const API_ENDPOINT = `${API_BASE}/?q=teams`;
const IMAGE_BASE = 'https://squiggle.com.au';

const app = document.getElementById('app');

async function getData() {
  let data = null;
  try {
    const response = await fetch(API_ENDPOINT);
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

async function render() {
  data = await getData();
  const { teams } = data;
  for (const team of teams) {

    console.log(team);

    const containerElement = document.createElement('div');
    const nameElement = document.createElement('h2');
    const logoElement = document.createElement('img');

    nameElement.innerHTML = team.name;
    logoElement.src = `${IMAGE_BASE}${team.logo}`;

    containerElement.appendChild(nameElement);
    containerElement.appendChild(logoElement);

    app.appendChild(containerElement);
  }
}
