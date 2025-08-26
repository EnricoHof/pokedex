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
            <ul class="types">
                ${pokemon.types
                  .map((type) => `<li class="type">${type.type.name}</li>`)
                  .join("")}
            </ul>
            
        </div>
    `;
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
  fillMovesTab(pokemon);
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
    .map((t) => {
      const color = getTypeColor(t.type.name);
      return `
      <span class="type-badge" style="background:${color}">
        <span class="type-dot"></span>${t.type.name}
      </span>
    `;
    })
    .join("");

  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  document.getElementById("about-tab").innerHTML = `
    <div class="card-panel">
      <div class="info-grid" aria-label="About Information">
        <div class="info-label">Height</div>
        <div class="info-value">${heightM} m</div>

        <div class="info-label">Weight</div>
        <div class="info-value">${weightKg} kg</div>

        <div class="info-label">Base Experience</div>
        <div class="info-value">${pokemon.base_experience ?? "-"}</div>

        <div class="info-label">Types</div>
        <div class="info-value type-badges">${typesHTML}</div>
      </div>
    </div>
  `;
}

function fillStatsTab(pokemon) {
  const statColors = {
    hp: "#ef4444",
    attack: "#22c55e",
    defense: "#3b82f6",
    "special-attack": "#a855f7",
    "special-defense": "#14b8a6",
    speed: "#f59e0b",
  };

  const max = 255;

  const rows = pokemon.stats.map((s) => {
    const key = s.stat.name;
    const label = statLabel(key);
    const value = s.base_stat;
    const color = statColors[key] || "#667eea";
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return { key, label, value, color, pct };
  });

  const html = `
    <div class="stats-grid" aria-label="Pokemon Basiswerte">
      ${rows
        .map(
          (r) => `
        <div class="stat-label">${r.label}</div>
        <div class="stat-bar" aria-hidden="true">
          <div class="stat-fill" style="--bar-color:${r.color}; width:0%"></div>
        </div>
        <div class="stat-value">${r.value}</div>
      `
        )
        .join("")}
    </div>
    <div class="stats-legend">
      ${rows
        .map(
          (r) => `
        <span><span class="dot" style="background:${r.color}"></span>${r.label}</span>
      `
        )
        .join("")}
    </div>
  `;

  const container = document.getElementById("stats-tab");
  container.innerHTML = html;

  requestAnimationFrame(() => {
    container.querySelectorAll(".stat-fill").forEach((el, i) => {
      const pct = rows[i].pct.toFixed(2) + "%";

      requestAnimationFrame(() => {
        el.style.width = pct;
      });
    });
  });

  function statLabel(key) {
    switch (key) {
      case "hp":
        return "HP";
      case "attack":
        return "Attack";
      case "defense":
        return "Defense";
      case "special-attack":
        return "Sp. Atk";
      case "special-defense":
        return "Sp. Def";
      case "speed":
        return "Speed";
      default:
        return key;
    }
  }
}

function fillMovesTab(pokemon) {
  const allMoves = pokemon.moves || [];
  let visibleCount = 12;

  const container = document.getElementById("moves-tab");
  container.innerHTML = `
    <div class="card-panel">
      <div class="moves-wrap">
        <ul class="moves-list" id="moves-list"></ul>
        <div class="moves-actions">
          <button class="btn-small" id="show-12">12</button>
          <button class="btn-small" id="show-24">24</button>
          <button class="btn-small" id="show-all">All (${allMoves.length})</button>
        </div>
      </div>
    </div>
  `;

  function renderMoves(count) {
    const list = container.querySelector("#moves-list");
    const subset = allMoves.slice(0, count);

    const items = subset
      .map((m) => {
        const name = m.move.name;
        let method = "-";
        let level = "-";

        const vd = (m.version_group_details || []).find(
          (v) => v.move_learn_method?.name
        );
        if (vd) {
          method = vd.move_learn_method?.name ?? "-";
          if (vd.level_learned_at && vd.level_learned_at > 0) {
            level = vd.level_learned_at;
          }
        }
        return `
        <li class="move-chip">
          <span class="name">${name}</span>
          <span class="lvl" title="Level learned">Lv ${level}</span>
          <span class="method" title="Learn method">${method}</span>
        </li>
      `;
      })
      .join("");

    list.innerHTML = items || "<li>Keine Moves gefunden.</li>";
  }

  renderMoves(visibleCount);

  container.querySelector("#show-12").addEventListener("click", () => {
    visibleCount = 12;
    renderMoves(visibleCount);
  });
  container.querySelector("#show-24").addEventListener("click", () => {
    visibleCount = 24;
    renderMoves(visibleCount);
  });
  container.querySelector("#show-all").addEventListener("click", () => {
    visibleCount = allMoves.length;
    renderMoves(visibleCount);
  });
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
