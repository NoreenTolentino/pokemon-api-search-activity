import { useState, useEffect } from 'react';
import './App.css';

const TARGET_POKEMON = ['charizard', 'charmeleon', 'charmander', 'pikachu', 'onix', 'gastly', 'wartortle', 'squirtle', 'bulbasaur', 'caterpie'];

const fuzzyMatch = (pokemonName, searchQuery) => {
  if (!searchQuery) return true;
  const nameLower = pokemonName.toLowerCase();
  const queryLower = searchQuery.toLowerCase();

  if (nameLower.includes(queryLower)) return true;

  let queryIndex = 0;
  for (let index = 0; index < nameLower.length; index++) {
    if (nameLower[index] === queryLower[queryIndex]) queryIndex++;
    if (queryIndex === queryLower.length) return true;
  }

  if (queryLower.length > 3) {
    let matchCount = 0;
    for (let character of queryLower) {
      if (nameLower.includes(character)) matchCount++;
    }
    if (matchCount >= queryLower.length - 1) return true;
  }

  return false;
};

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(TARGET_POKEMON.map(name => fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(response => response.json())))
      .then(setPokemonList)
      .catch(error => console.error('Error fetching Pokémon:', error))
      .finally(() => setLoading(false));
  }, []);

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  
  const filteredPokemon = pokemonList.filter(pokemon => fuzzyMatch(pokemon.name, searchTerm));

  if (loading) return <h2 className="status-text">Loading Pokémon data...</h2>;

  return (
    <div className="app-container">
      <h1 className="header-title">Pokémon Data</h1>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search Pokémon name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-box"
        />
      </div>

      <div className="card-grid">
        {filteredPokemon.length ? filteredPokemon.map(({ id, name, sprites, types, height, weight }) => (
          <div key={id} className="pokemon-card">
            <div className="card-header">
              <h2>{capitalize(name)}</h2>
              <span className="pokemon-id">#{String(id).padStart(3, '0')}</span>
            </div>

            <div className="card-image">
              <img src={sprites.front_default} alt={name} />
            </div>

            <div className="types-list">
              <span className="label">TYPE</span>
              <div className="badge-group">
                {types.map(({ type }) => (
                  <span key={type.name} className="type-badge">{type.name}</span>
                ))}
              </div>
            </div>

            <div className="attributes-grid">
              <div>
                <small>HEIGHT</small>
                <p>{height / 10} m</p>
              </div>
              <div>
                <small>WEIGHT</small>
                <p>{weight / 10} kg</p>
              </div>
            </div>
          </div>
        )) : <p className="status-text">No Pokémon found matching "{searchTerm}"</p>}
      </div>
    </div>
  );
}