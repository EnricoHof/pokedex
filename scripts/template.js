// Template Funktionen für HTML-Erstellung
// Alle Funktionen die HTML-Strings zurückgeben

// HTML für eine Pokemon Karte erstellen
function buildPokemonCard(pokemonData) {
  const cardBackgroundColor = getPokemonTypeColor(
    pokemonData.types[0].type.name
  );
  const pokemonName =
    pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

  const typesList = pokemonData.types
    .map((typeInfo) => `<li class="type">${typeInfo.type.name}</li>`)
    .join("");

  return `
    <div class="card" data-pokemon-id="${pokemonData.id}" style="background-color: ${cardBackgroundColor}" onclick="openPokemonModal(${pokemonData.id})">
      <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
      <h2>${pokemonName}</h2>
      <ul class="types">${typesList}</ul>
    </div>
  `;
}

// Type Badges HTML erstellen
function createTypeBadges(pokemonTypes) {
  return pokemonTypes
    .map((typeInfo) => {
      const typeColor = getPokemonTypeColor(typeInfo.type.name);
      return `
        <span class="type-badge" style="background:${typeColor}">
          <span class="type-dot"></span>${typeInfo.type.name}
        </span>
      `;
    })
    .join("");
}

// HTML für About Tab erstellen
function createAboutTabHTML(pokemonData) {
  const typeBadges = createTypeBadges(pokemonData.types);
  const heightInMeters = (pokemonData.height / 10).toFixed(1);
  const weightInKilograms = (pokemonData.weight / 10).toFixed(1);
  const baseExperience = pokemonData.base_experience ?? "-";

  return `
    <div class="card-panel">
      <div class="info-grid">
        <div class="info-label">Height</div>
        <div class="info-value">${heightInMeters} m</div>
        <div class="info-label">Weight</div>
        <div class="info-value">${weightInKilograms} kg</div>
        <div class="info-label">Base Experience</div>
        <div class="info-value">${baseExperience}</div>
        <div class="info-label">Types</div>
        <div class="info-value type-badges">${typeBadges}</div>
      </div>
    </div>
  `;
}

// HTML für Statistiken erstellen
function buildStatsHTML(statRows) {
  const statsGrid = statRows
    .map(
      (row) => `
      <div class="stat-label">${row.label}</div>
      <div class="stat-bar">
        <div class="stat-fill" style="--bar-color:${row.color}; width:0%"></div>
      </div>
      <div class="stat-value">${row.value}</div>
    `
    )
    .join("");

  const statsLegend = statRows
    .map(
      (row) => `
      <span><span class="dot" style="background:${row.color}"></span>${row.label}</span>
    `
    )
    .join("");

  return `
    <div class="stats-grid">${statsGrid}</div>
    <div class="stats-legend">${statsLegend}</div>
  `;
}

// HTML für Moves Tab erstellen
function createMovesTabHTML(totalMoves) {
  return `
    <div class="card-panel">
      <div class="moves-wrap">
        <ul class="moves-list" id="moves-list"></ul>
        <div class="moves-actions">
          <button class="btn-small" onclick="showMoves(12)">12</button>
          <button class="btn-small" onclick="showMoves(24)">24</button>
          <button class="btn-small" onclick="showMoves(${totalMoves})">All (${totalMoves})</button>
        </div>
      </div>
    </div>
  `;
}

// HTML für einzelne Attacke erstellen
function createMoveItemHTML(moveInfo) {
  const moveName = moveInfo.move.name;
  const moveDetails = getMoveDetails(moveInfo);

  return `
    <li class="move-chip">
      <span class="name">${moveName}</span>
      <span class="lvl" title="Level learned">Lv ${moveDetails.level}</span>
      <span class="method" title="Learn method">${moveDetails.method}</span>
    </li>
  `;
}

// HTML für Moves Liste erstellen
function createMovesListHTML(movesToShow) {
  if (movesToShow.length === 0) {
    return "<li>Keine Moves gefunden.</li>";
  }

  return movesToShow.map((moveInfo) => createMoveItemHTML(moveInfo)).join("");
}
