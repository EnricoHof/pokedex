const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

async function fetchPokemonData(id) {
  let response = await fetch(BASE_URL + id);
  let responseToJson = await response.json();
  return responseToJson;
}

function getTypeColor(typeName) {
  return typeColors[typeName] || "#68A090";
}

function createPokemonCard(pokemon) {
  const backgroundColor = getTypeColor(pokemon.types[0].type.name);

  return `
        <div class="card" data-pokemon-id="${
          pokemon.id
        }" style="background-color: ${backgroundColor}">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h2>${
              pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
            }</h2>
            
        </div>
    `;
}

async function testCard() {
  const pokemon = await fetchPokemonData(25);
  const cardHTML = createPokemonCard(pokemon);
  document.getElementById("pokemon-container").innerHTML = cardHTML;
}

async function loadMultiplePokemon(startId, count) {
  showLoading();
  let allCardsHTML = "";

  for (let i = startId; i < startId + count; i++) {
    const pokemon = await fetchPokemonData(i);
    const cardHTML = createPokemonCard(pokemon);
    allCardsHTML += cardHTML;
  }
  document.getElementById("pokemon-container").innerHTML += allCardsHTML;
  hideLoading();
}

let currentOffset = 0;

loadMultiplePokemon(currentOffset + 1, 20);

currentOffset += 20;

document.getElementById("load-more-btn").addEventListener("click", async () => {
  document.getElementById("load-more-btn").disabled = true;
  currentOffset += 20;
  await loadMultiplePokemon(currentOffset + 1, 20);
  document.getElementById("load-more-btn").disabled = false;

  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

function showLoading() {
  document.getElementById("loading-spinner").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading-spinner").style.display = "none";
}

document
  .getElementById("pokemon-container")
  .addEventListener("click", (event) => {
    if (event.target.closest(".card")) {
      const pokemonId = event.target.closest(".card").dataset.pokemonId;
      openModal(pokemonId);
    }
  });

async function openModal(pokemonId) {
  showModal();
  const pokemon = await fetchPokemonData(pokemonId);
  fillModalContent(pokemon);
}

function showModal() {
  document.querySelector(".dialog").classList.add("show");
  document.body.classList.add("modal-open");
}

function fillModalContent(pokemon) {
  fillBasicInfo(pokemon);
  fillAboutTab(pokemon);
  fillStatsTab(pokemon);
  fillMovesTab();
}

function fillBasicInfo(pokemon) {
  const backgroundColor = getTypeColor(pokemon.types[0].type.name);
  document.querySelector(
    ".dialog-pokemon-number"
  ).textContent = `#${pokemon.id}`;
  document.querySelector(".dialog-pokemon-headline").textContent =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  document.querySelector(
    ".dialog-pokemon-picture"
  ).innerHTML = `<img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">`;
  document.querySelector(".dialog-header").style.backgroundColor =
    backgroundColor;
}

function fillAboutTab(pokemon) {
  const typesHTML = pokemon.types
    .map((type) => `<span class="type-badge">${type.type.name}</span>`)
    .join("");

  document.getElementById("about-tab").innerHTML = `
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Types:</strong> ${typesHTML}</p>
    `;
}

function fillStatsTab(pokemon) {
  const statsHTML = pokemon.stats
    .map(
      (stat) => `<p><strong>${stat.stat.name}:</strong> ${stat.base_stat}</p>`
    )
    .join("");
  document.getElementById("stats-tab").innerHTML = statsHTML;
}

function fillMovesTab() {
  document.getElementById("moves-tab").innerHTML = "<p>Coming soon...</p>";
}

function closeModal() {
  document.querySelector(".dialog").classList.remove("show");
  document.body.classList.remove("modal-open");
}

document.querySelector(".close-dialog").addEventListener("click", closeModal);

document.querySelector(".dialog-overlay").addEventListener("click", closeModal);

document.getElementById("psearch").addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  if (searchTerm.length >= 3 || searchTerm.length === 0) {
    filterPokemon(searchTerm);
  }
});

function filterPokemon(searchTerm) {
  const allCards = document.querySelectorAll(".card");

  allCards.forEach((card) => {
    const pokemonName = card.querySelector("h2").textContent.toLowerCase();

    if (pokemonName.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function getLoadedPokemonIds() {
  const cards = document.querySelectorAll(".card");
  return Array.from(cards).map((card) => parseInt(card.dataset.pokemonId));
}

function getNextPokemonId(currentId) {
  const loadedIds = getLoadedPokemonIds().sort((a, b) => a - b);
  const currentIndex = loadedIds.indexOf(currentId);
  return loadedIds[currentIndex + 1];
}

function getPreviousPokemonId(currentId) {
  const loadedIds = getLoadedPokemonIds().sort((a, b) => a - b);
  const currentIndex = loadedIds.indexOf(currentId);
  return loadedIds[currentIndex - 1];
}

function getNextPokemonId(currentId) {
  const loadedIds = getLoadedPokemonIds().sort((a, b) => a - b);
  const currentIndex = loadedIds.indexOf(currentId);
  const nextId = loadedIds[currentIndex + 1];

  if (!nextId) {
    showLoadMoreInModal();
    return null;
  }
  return nextId;
}

document.querySelector(".modal-nav-right").addEventListener("click", () => {
  const currentId = parseInt(
    document
      .querySelector(".dialog-pokemon-number")
      .textContent.replace("#", "")
  );
  const nextId = getNextPokemonId(currentId);

  if (nextId) {
    openModal(nextId);
  }
});

document.querySelector(".modal-nav-left").addEventListener("click", () => {
  const currentId = parseInt(
    document
      .querySelector(".dialog-pokemon-number")
      .textContent.replace("#", "")
  );
  const previousId = getPreviousPokemonId(currentId);

  if (previousId) {
    openModal(previousId);
  }
});

function showLoadMoreInModal() {
  document.querySelector(".modal-load-more").style.display = "block";
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const targetTab = e.target.dataset.tab;

    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-pane")
      .forEach((pane) => pane.classList.remove("active"));

    e.target.classList.add("active");
    document.getElementById(targetTab + "-tab").classList.add("active");
  });
});
