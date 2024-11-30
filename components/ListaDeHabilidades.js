import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Image, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';

const App = () => {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [allMoves, setAllMoves] = useState([]);
  const [displayedMoves, setDisplayedMoves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pokedex, setPokedex] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [nextUrl, setNextUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=20'); // URL para carregar os Pokémon
  const [loadingPokemons, setLoadingPokemons] = useState(false);

  // Carrega a lista inicial da Pokédex
  useEffect(() => {
    const fetchPokedex = async () => {
      setLoadingPokemons(true);
      try {
        const response = await axios.get(nextUrl);
        const data = response.data;

        // Adiciona as imagens dos Pokémon na Pokédex
        const pokedexWithImages = await Promise.all(
          data.results.map(async (pokemon) => {
            const pokemonResponse = await axios.get(pokemon.url);
            const pokemonData = pokemonResponse.data;
            return { name: pokemon.name, image: pokemonData.sprites.front_default };
          })
        );

        setPokedex((prevPokedex) => [...prevPokedex, ...pokedexWithImages]); // Adiciona os novos Pokémon à lista existente
        setNextUrl(data.next); // Atualiza a URL para a próxima página de Pokémon
      } catch (err) {
        console.error('Erro ao carregar a Pokédex:', err);
      } finally {
        setLoadingPokemons(false);
      }
    };

    fetchPokedex();
  }, [nextUrl]); // Recarrega quando o nextUrl mudar

  // Função para buscar um Pokémon por nome ou ID
  const fetchPokemon = async (name) => {
    setLoading(true);
    setError('');
    setPokemonData(null);
    setAllMoves([]);
    setDisplayedMoves([]);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      const data = response.data;
      setPokemonData(data);

      // Fetch detailed information for each move
      const moveDetails = await Promise.all(
        data.moves.map(async (move) => {
          const moveResponse = await axios.get(move.move.url);
          const moveData = moveResponse.data;
          return {
            name: move.move.name,
            description: moveData.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || 'No description available',
          };
        })
      );
      setAllMoves(moveDetails);
      setDisplayedMoves(moveDetails.slice(0, 4)); // Exibe os primeiros 4 ataques inicialmente
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler para selecionar um Pokémon da Pokédex
  const handleSelectPokemon = (name) => {
    setSelectedPokemon(name);
    fetchPokemon(name);
  };

  // Função para carregar mais ataques
  const loadMoreMoves = () => {
    setDisplayedMoves(allMoves.slice(0, displayedMoves.length + 4));
  };

  // Função para carregar mais Pokémon
  const loadMorePokemons = () => {
    if (nextUrl) {
      setNextUrl(nextUrl); // Carrega mais Pokémon da próxima URL
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Pokémon Finder</Text>
      </View>

      {/* Entrada de texto para buscar Pokémon manualmente */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Pokémon name or ID"
          value={pokemonName}
          onChangeText={setPokemonName}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => fetchPokemon(pokemonName)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Exibição de carregamento e erro */}
      {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loading} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Exibição dos detalhes do Pokémon selecionado */}
      {pokemonData && !loading && (
        <View style={styles.pokemonContainer}>
          <Text style={styles.pokemonName}>
            {pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}
          </Text>
          <Image
            source={{ uri: pokemonData.sprites.front_default }}
            style={styles.pokemonImage}
          />
          <Text style={styles.pokemonInfo}><Text style={styles.boldText}>ID:</Text> {pokemonData.id}</Text>
          <Text style={styles.pokemonInfo}><Text style={styles.boldText}>Type:</Text> {pokemonData.types.map(type => type.type.name).join(', ')}</Text>
          <Text style={styles.pokemonInfo}><Text style={styles.boldText}>Height:</Text> {pokemonData.height / 10} m</Text>
          <Text style={styles.pokemonInfo}><Text style={styles.boldText}>Weight:</Text> {pokemonData.weight / 10} kg</Text>

          <Text style={styles.movesTitle}>Moves:</Text>
          {displayedMoves.map((move, index) => (
            <View key={index} style={styles.moveContainer}>
              <Text style={styles.moveName}>
                {move.name.charAt(0).toUpperCase() + move.name.slice(1)}
              </Text>
              <Text style={styles.moveDescription}>{move.description}</Text>
            </View>
          ))}

          {displayedMoves.length < allMoves.length && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreMoves}
            >
              <Text style={styles.loadMoreText}>Load More Moves</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Pokédex */}
      <View style={styles.pokedexContainer}>
        <Text style={styles.pokedexTitle}>Pokédex</Text>
        <FlatList
          data={pokedex}
          keyExtractor={(item) => item.name}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectPokemon(item.name)} style={styles.pokedexItem}>
              <Image source={{ uri: item.image }} style={styles.pokedexImage} />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Botão Carregar Mais Pokémon */}
      {loadingPokemons ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loading} />
      ) : (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={loadMorePokemons}
        >
          <Text style={styles.loadMoreText}>Load More Pokémon</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  titleContainer: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#2C6C9D',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#FFD700',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 8,
    width: '70%',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  pokemonContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    elevation: 5,
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pokemonImage: {
    width: 150,
    height: 150,
    marginVertical: 16,
  },
  pokemonInfo: {
    fontSize: 16,
    marginVertical: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  movesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  moveContainer: {
    marginBottom: 8,
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 10,
    borderWidth: 2,
    borderColor: 'blue',
  },
  moveName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moveDescription: {
    fontSize: 14,
    color: '#555',
  },
  loadMoreButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pokedexContainer: {
    width: '100%',
    marginTop: 20,
  },
  pokedexTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pokedexItem: {
    alignItems: 'center',
    margin: 8,
    borderWidth: 2,
    borderColor: 'blue', // Contorno azul
    borderRadius: 8,
    padding: 8,
  },
  pokedexImage: {
    width: 80,
    height: 80,
  },
});

export default App;
