const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const maxRecords = 151;
const limit = 10;
let offset = 0;

const statsMapper = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk.",
  "special-defense": "Sp. Def.",
  speed: "Speed",
};

// function normalizeStat(stat) {
//   if (stat.includes("-")) return stat.replaceAll("-", " ");
//   return stat;
// }

function convertPokemonToLi(pokemon) {
  return `
            <button class="wrapper" id="show-details__${pokemon.number}">
                <li class="pokemon ${pokemon.type}">
                        <span class="number">#${pokemon.number}</span>
                        <span class="name">${pokemon.name}</span>

                        <div class="detail">
                            <ol class="types">
                                ${pokemon.types
                                  .map(
                                    (type) =>
                                      `<li class="type ${type}">${type}</li>`
                                  )
                                  .join("")}
                            </ol>

                            <img src="${pokemon.photo}"
                                alt="${pokemon.name}">
                        </div>
                </li>
            </button>
    `;
}

function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons.map(convertPokemonToLi).join("");
    pokemonList.innerHTML += newHtml;
  });
}

loadPokemonItens(offset, limit);

document.addEventListener("click", async (event) => {
  const {
    target: { id },
  } = event;
  const [prefix, pokemonNumber] = id.split("__");
  if (prefix !== "show-details") return;
  const pokemon = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`
  ).then((res) => res.json());
  const HTML = `
        <div class="pokemon-modal ${pokemon.types[0].type.name}">
            <header class="modal-header">
                <div>
                    <span class="name">${pokemon.name}</span>

                    <div class="detail">
                        <ol class="types">
                            ${pokemon.types
                              .map(
                                (type) =>
                                  `<li class="type ${type.type.name}">${type.type.name}</li>`
                              )
                              .join("")}
                        </ol>
            
                        
                    </div>
                </div>

                <span class="number">#${pokemon.id}</span>

            </header>
            <img src="${pokemon.sprites.other.dream_world.front_default}"
                alt="${pokemon.name}">
            <section class="stats">
                <ul>
                ${pokemon.stats
                  .map(
                    (stat) =>
                      `<li class="stat">
                        <span class="key">${
                          statsMapper[stat.stat.name] || stat.stat.name
                        }</span>
                        <span class="value">${stat.base_stat}</span>
                        <div class="chart">
                            <span class="chart-full"></span>
                            <span class="chart-current"></span>
                        </div>
                    </li>`
                  )
                  .join("")}
                </ul>
            </section>

        </div>
  `;
  const container = document.createElement("section");
  container.className = "modal";
  container.id = "modal-container";
  container.innerHTML = HTML;
  document.body.appendChild(container);
  const current = Array.prototype.slice.call(
    document.getElementsByClassName("chart-current")
  );
  const fullChart = document.getElementsByClassName("chart-full").item(0);
  const fullWidth = fullChart.clientWidth;
  current.forEach((elem, index) => {
    const width = (fullWidth * pokemon.stats[index].base_stat) / 100;
    const color = pokemon.stats[index].base_stat < 50 ? "#ff0000" : "#008000";
    elem.setAttribute("style", `width:${width}px;background-color:${color};`);
  });

  function removeModal(event) {
    if (event.target.id === "modal-container") {
      document.body.removeChild(container);
      document.removeEventListener("click", removeModal);
    }
  }
  document.addEventListener("click", removeModal);
});

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  const qtdRecordsWithNexPage = offset + limit;

  if (qtdRecordsWithNexPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItens(offset, newLimit);

    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItens(offset, limit);
  }
});
