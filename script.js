// Aktuelle Position für das Laden von Pokemon
let currentPokemonOffset = 0;
const pokemonCache = {};

// Pokemon Daten von der API laden
async function loadPokemonFromAPI(pokemonId) {
  if (pokemonCache[pokemonId]) {
    return pokemonCache[pokemonId];
  }
  let apiResponse = await fetch(POKEMON_API_URL + pokemonId);
  let pokemonData = await apiResponse.json();
  pokemonCache[pokemonId] = pokemonData;
  return pokemonData;
}

// Farbe für Pokemon Typ zurückgeben
function getPokemonTypeColor(typeName) {
  return pokemonTypeColors[typeName] || "#68A090";
}

// Mehrere Pokemon laden und anzeigen
async function loadAndDisplayPokemon(startingId, pokemonCount) {
  showLoadingSpinner();
  let allPokemonCards = "";

  for (
    let pokemonId = startingId;
    pokemonId < startingId + pokemonCount;
    pokemonId++
  ) {
    const pokemonData = await loadPokemonFromAPI(pokemonId);
    const pokemonCard = buildPokemonCard(pokemonData);
    allPokemonCards += pokemonCard;
  }

  document.getElementById("pokemon-container").innerHTML += allPokemonCards;
  hideLoadingSpinner();
}

// Lade-Animation anzeigen
function showLoadingSpinner() {
  document.getElementById("loading-spinner").style.display = "block";
}

// Lade-Animation verstecken
function hideLoadingSpinner() {
  document.getElementById("loading-spinner").style.display = "none";
}

// Modal Dialog öffnen
function openPokemonModal(pokemonId) {
  showPokemonModal();
  loadPokemonIntoModal(pokemonId);
}

// Modal Dialog anzeigen
function showPokemonModal() {
  document.querySelector(".dialog").classList.add("show");
  document.body.classList.add("modal-open");
}

// Pokemon Daten in Modal laden
async function loadPokemonIntoModal(pokemonId) {
  const pokemonData = await loadPokemonFromAPI(pokemonId);
  fillAllModalTabs(pokemonData);
}

// Alle Modal Tabs mit Daten füllen
function fillAllModalTabs(pokemonData) {
  fillModalBasicInfo(pokemonData);
  fillModalAboutTab(pokemonData);
  fillModalStatsTab(pokemonData);
  fillModalMovesTab(pokemonData);
}

// Grundlegende Pokemon Informationen im Modal anzeigen
function fillModalBasicInfo(pokemonData) {
  const headerBackgroundColor = getPokemonTypeColor(
    pokemonData.types[0].type.name
  );
  const pokemonName =
    pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

  document.querySelector(
    ".dialog-pokemon-number"
  ).textContent = `#${pokemonData.id}`;
  document.querySelector(".dialog-pokemon-headline").textContent = pokemonName;
  document.querySelector(
    ".dialog-pokemon-picture"
  ).innerHTML = `<img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">`;
  document.querySelector(".dialog-header").style.backgroundColor =
    headerBackgroundColor;
}

// About Tab mit Pokemon Details füllen
function fillModalAboutTab(pokemonData) {
  const aboutHTML = createAboutTabHTML(pokemonData);
  document.getElementById("about-tab").innerHTML = aboutHTML;
}

// Stats Tab mit Pokemon Statistiken füllen
function fillModalStatsTab(pokemonData) {
  const statColorMap = getStatColorMap();
  const maxStatValue = 255;
  const statRows = createStatRows(
    pokemonData.stats,
    statColorMap,
    maxStatValue
  );

  const statsHTML = buildStatsHTML(statRows);
  const statsContainer = document.getElementById("stats-tab");
  statsContainer.innerHTML = statsHTML;

  animateStatBars(statsContainer, statRows);
}

// Farben für Statistiken definieren
function getStatColorMap() {
  return {
    hp: "#ef4444",
    attack: "#22c55e",
    defense: "#3b82f6",
    "special-attack": "#a855f7",
    "special-defense": "#14b8a6",
    speed: "#f59e0b",
  };
}

// Statistik Zeilen erstellen
function createStatRows(pokemonStats, colorMap, maxValue) {
  return pokemonStats.map((statInfo) => {
    const statKey = statInfo.stat.name;
    const statLabel = getStatDisplayName(statKey);
    const statValue = statInfo.base_stat;
    const statColor = colorMap[statKey] || "#667eea";
    const statPercentage = Math.max(
      0,
      Math.min(100, (statValue / maxValue) * 100)
    );
    return {
      key: statKey,
      label: statLabel,
      value: statValue,
      color: statColor,
      percentage: statPercentage,
    };
  });
}

// Anzeigename für Statistik zurückgeben
function getStatDisplayName(statKey) {
  const statNames = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };
  return statNames[statKey] || statKey;
}

// Statistik Balken animieren
function animateStatBars(container, statRows) {
  requestAnimationFrame(() => {
    container.querySelectorAll(".stat-fill").forEach((barElement, index) => {
      const percentage = statRows[index].percentage.toFixed(2) + "%";
      requestAnimationFrame(() => {
        barElement.style.width = percentage;
      });
    });
  });
}

// Moves Tab mit Pokemon Attacken füllen
function fillModalMovesTab(pokemonData) {
  const allMoves = pokemonData.moves || [];
  let visibleMoveCount = 12;

  const movesContainer = document.getElementById("moves-tab");
  movesContainer.innerHTML = createMovesTabHTML(allMoves.length);

  displayMoves(movesContainer, allMoves, visibleMoveCount);
  setupMoveButtons(movesContainer, allMoves);
}

// Attacken anzeigen
function displayMoves(container, allMoves, count) {
  const movesList = container.querySelector("#moves-list");
  const movesToShow = allMoves.slice(0, count);
  const movesHTML = createMovesListHTML(movesToShow);
  movesList.innerHTML = movesHTML;
}

// Details für eine Attacke ermitteln
function getMoveDetails(moveInfo) {
  let learnMethod = "-";
  let learnLevel = "-";
  const versionDetails = (moveInfo.version_group_details || []).find(
    (version) => version.move_learn_method?.name
  );
  if (versionDetails) {
    learnMethod = versionDetails.move_learn_method?.name ?? "-";
    if (
      versionDetails.level_learned_at &&
      versionDetails.level_learned_at > 0
    ) {
      learnLevel = versionDetails.level_learned_at;
    }
  }
  return { method: learnMethod, level: learnLevel };
}

// Move Buttons einrichten
function setupMoveButtons(container, allMoves) {
  window.showMoves = function (count) {
    displayMoves(container, allMoves, count);
  };
}

// Modal Dialog schließen
function closeModal() {
  document.querySelector(".dialog").classList.remove("show");
  document.body.classList.remove("modal-open");
}

// Pokemon nach Namen filtern
function filterPokemonByName(searchText) {
  const allPokemonCards = document.querySelectorAll(".card");
  allPokemonCards.forEach((card) => {
    const pokemonName = card.querySelector("h2").textContent.toLowerCase();
    const pokemonTypes = Array.from(card.querySelectorAll("li")).map((li) =>
      li.textContent.toLowerCase()
    );
    const matchByName = pokemonName.includes(searchText);
    const matchByType = pokemonTypes.some((type) => type.includes(searchText));
    if (searchText === "" || matchByName || matchByType) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Alle geladenen Pokemon IDs ermitteln
function getAllLoadedPokemonIds() {
  const pokemonCards = document.querySelectorAll(".card");
  return Array.from(pokemonCards).map((card) =>
    parseInt(card.dataset.pokemonId)
  );
}

// Nächste Pokemon ID finden
function findNextPokemonId(currentId) {
  const loadedIds = getAllLoadedPokemonIds().sort((a, b) => a - b);
  const currentIndex = loadedIds.indexOf(currentId);
  return loadedIds[currentIndex + 1];
}

// Vorherige Pokemon ID finden
function findPreviousPokemonId(currentId) {
  const loadedIds = getAllLoadedPokemonIds().sort((a, b) => a - b);
  const currentIndex = loadedIds.indexOf(currentId);
  return loadedIds[currentIndex - 1];
}

// Aktuelle Pokemon ID aus Modal ermitteln
function getCurrentPokemonId() {
  const pokemonNumberText = document.querySelector(
    ".dialog-pokemon-number"
  ).textContent;
  return parseInt(pokemonNumberText.replace("#", ""));
}

// Tab wechseln
function switchToTab(tabName) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((button) => button.classList.remove("active"));
  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => pane.classList.remove("active"));

  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(tabName + "-tab").classList.add("active");
}

// Event Handler Funktionen
function handleSearchInput() {
  const searchInput = document.getElementById("psearch");
  const searchText = searchInput.value.toLowerCase();
  const loadButton = document.getElementById("load-more-btn");
  if (searchText.length >= 3) {
    filterPokemonByName(searchText);
  } else if (searchText.length === 0) {
    filterPokemonByName("");
  }
  loadButton.style.display = searchText.length >= 3 ? "none" : "";
}

async function handleLoadMoreClick() {
  const loadButton = document.getElementById("load-more-btn");
  if (loadButton.disabled) return;
  loadButton.disabled = true;
  currentPokemonOffset += 20;
  await loadAndDisplayPokemon(currentPokemonOffset + 1, 20);
  loadButton.disabled = false;
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function handleCardClick(clickEvent) {
  const clickedCard = clickEvent.target.closest(".card");
  if (clickedCard) {
    const pokemonId = clickedCard.dataset.pokemonId;
    openPokemonModal(pokemonId);
  }
}

function handleNextPokemon() {
  const currentId = getCurrentPokemonId();
  const nextId = findNextPokemonId(currentId);
  if (nextId) {
    openPokemonModal(nextId);
  }
}

function handlePreviousPokemon() {
  const currentId = getCurrentPokemonId();
  const previousId = findPreviousPokemonId(currentId);
  if (previousId) {
    openPokemonModal(previousId);
  }
}

// Tab Button Click Handler
function handleTabClick(clickEvent) {
  const targetTab = clickEvent.target.dataset.tab;
  if (targetTab) {
    switchToTab(targetTab);
  }
}

// Overlay Click Handler
function handleOverlayClick() {
  closeModal();
}

// Initialisierung beim Laden der Seite
loadAndDisplayPokemon(currentPokemonOffset + 1, 20);
currentPokemonOffset += 20;

// Tab Buttons einrichten
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.onclick = handleTabClick;
});

// Overlay Click einrichten
document.querySelector(".dialog-overlay").onclick = handleOverlayClick;
