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

    const itemContainerElement = Object.assign(
      document.createElement('div'), { className: 'item' }
    );
    const itemDataElement = Object.assign(
      document.createElement('div'), { className: 'data' }
    );
    const nameElement = document.createElement('h2');
    const logoElement = document.createElement('img');

    nameElement.innerHTML = team.name;
    logoElement.src = `${IMAGE_BASE}${team.logo}`;

    itemDataElement.appendChild(nameElement);
    itemDataElement.appendChild(logoElement);

    itemContainerElement.appendChild(itemDataElement);

    app.appendChild(itemContainerElement);
  }
}
