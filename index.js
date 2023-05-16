const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let pokemonTypes = []

const updatePokemonTypeFilterDiv = () => {
    axios.get('https://pokeapi.co/api/v2/type')
        .then((res) => {
            pokemonTypes = res.data.results
            pokemonTypes.forEach((type) => {
                $('#pokemonTypeFilter').append(`
                <input type="checkbox" id="${type.name}" name="${type.name}" value="${type.name}">
                <label for="${type.name}">${type.name}</label>
                `)
            })
        }
    )
}

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const endPage = numPages;
  console.log(endPage)
  for (let i = currentPage; (i <= currentPage + 4 && i <= endPage); i++) {
    if (i === currentPage && currentPage !== 1) {
        $('#pagination').append(`
        <button class="btn btn-primary numberedButtons" value="${currentPage - 1}">Previous</button>
        `)
    }
    $('#pagination').append(`
    <button class="btn btn-primary numberedButtons" value="${i}">${i}</button>
    `)
    if (i === currentPage + 4 && currentPage !== endPage) {
        $('#pagination').append(`
        <button class="btn btn-primary numberedButtons" value="${currentPage + 1}">Next</button>
        `)
    }
    if (i === currentPage) {
        $(`button[value=${i}]`).removeClass('btn-primary')
        $(`button[value=${i}]`).addClass('btn-warning')
    }
  }
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  number_of_pokemon = 0;

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    number_of_pokemon++;
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
  $('#numberOfPokemon').html(`
    <h3>Total number of Pokemon: ${pokemons.length}</h3>
    <h3>Number of Pokemon displayed: ${number_of_pokemon}</h3>
    `)
}

const setup = async () => {
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  updatePokemonTypeFilterDiv()
  paginate(currentPage, PAGE_SIZE, pokemons)
  let numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

  // add event listener to pokemon type filter checkboxes and display pokemon of that type when the button is checked
    $('body').on('change', '#pokemonTypeFilter input', async function (e) {
        const checkedPokemonTypes = $('#pokemonTypeFilter input:checked').map((index, element) => element.value).get()
        if (checkedPokemonTypes.length === 0) {
            pokemons = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810').then((res) => res.data.results)
        } else if (checkedPokemonTypes.length === 1) {
            console.log(checkedPokemonTypes)
            pokemons = await axios.get(`https://pokeapi.co/api/v2/type/${checkedPokemonTypes[0]}`).then((res) => res.data.pokemon.map((pokemon) => pokemon.pokemon))
        } else if (checkedPokemonTypes.length === 2) {
            console.log(checkedPokemonTypes);
            pokemonOne = await axios.get(`https://pokeapi.co/api/v2/type/${checkedPokemonTypes[0]}`).then((res) => res.data.pokemon.map((pokemon) => pokemon.pokemon))
            pokemonTwo = await axios.get(`https://pokeapi.co/api/v2/type/${checkedPokemonTypes[1]}`).then((res) => res.data.pokemon.map((pokemon) => pokemon.pokemon))
            pokemons = pokemonOne.filter(pokemon => pokemonTwo.find(p => p.name === pokemon.name));
        } else {
            pokemons = []
        }
        // paginate again from the first page
        currentPage = 1;
        paginate(currentPage, PAGE_SIZE, pokemons)
        numPages = Math.ceil(pokemons.length / PAGE_SIZE)
        updatePaginationDiv(currentPage, numPages)
    })
}

$(document).ready(setup)