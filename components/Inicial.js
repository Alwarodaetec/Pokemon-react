import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';

const App = () => {
  const [pokemonName, setPokemonName] = useState(''); // Nome do Pokémon para pesquisa
  const [pokemons, setPokemons] = useState([]); // Lista de Pokémons carregados
  const [loading, setLoading] = useState(false); // Para indicar carregamento
  const [error, setError] = useState(''); // Para exibir erros
  const [pokemonDetail, setPokemonDetail] = useState(null); // Detalhes do Pokémon selecionado
  const [nextUrl, setNextUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=30'); // URL da próxima página de Pokémons

  // Função para carregar os Pokémons
  const fetchPokemons = async (url) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      const data = await response.json();
      setPokemons(prevPokemons => [...prevPokemons, ...data.results]); // Adiciona os Pokémons à lista existente
      setNextUrl(data.next); // Atualiza a URL para a próxima página
    } catch (err) {
      setError('Failed to load Pokémon data');
    } finally {
      setLoading(false);
    }
  };

  // Função para pesquisar Pokémon por nome ou ID
  const searchPokemon = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Pokémon not found');
      }
      const data = await response.json();
      setPokemonDetail(data); // Exibe as informações do Pokémon pesquisado
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar detalhes do Pokémon ao clicar na lista
  const fetchPokemonDetails = async (url) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      const data = await response.json();
      setPokemonDetail(data); // Exibe as informações do Pokémon clicado
    } catch (err) {
      setError('Failed to load Pokémon details');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar mais Pokémons
  const loadMorePokemons = () => {
    if (nextUrl) {
      fetchPokemons(nextUrl); // Carregar mais Pokémons usando a URL da próxima página
    }
  };

  useEffect(() => {
    fetchPokemons(nextUrl); // Carrega os primeiros Pokémons
  }, []);

  // Função para detectar quando o usuário chega no final da lista
  const handleEndReached = () => {
    if (!loading && nextUrl) {
      loadMorePokemons(); // Carrega mais Pokémons se houver uma URL da próxima página
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokémon Finder</Text>

      {/* Barra de pesquisa com o botão ao lado */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Pokémon name or ID"
          value={pokemonName}
          onChangeText={setPokemonName}
          placeholderTextColor="#8e8e8e"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchPokemon}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Exibição de erro */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Exibição de carregamento */}
      {loading && !pokemonDetail && (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loading} />
      )}

      {/* Detalhes do Pokémon - Será exibido acima da lista de Pokémons */}
      {pokemonDetail && !loading && (
        <View style={styles.pokemonDetailContainer}>
          <Image
            source={{ uri: pokemonDetail.sprites.other['official-artwork'].front_default }}
            style={styles.pokemonDetailImage}
          />
          <Text style={styles.pokemonDetailName}>
            {pokemonDetail.name.charAt(0).toUpperCase() + pokemonDetail.name.slice(1)}
          </Text>
          <Text style={styles.pokemonDetailText}>
            ID: {pokemonDetail.id}
          </Text>
          <Text style={styles.pokemonDetailText}>
            Types: {pokemonDetail.types.map(type => type.type.name).join(', ')}
          </Text>
        </View>
      )}

      {/* Lista de Pokémons */}
      <FlatList
        data={pokemons}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pokemonCard}
            onPress={() => fetchPokemonDetails(item.url)} // Chama função para pegar detalhes do Pokémon
          >
            <Image
              source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.url.split('/')[6]}.png` }}
              style={styles.pokemonImageCard}
            />
            <Text style={styles.pokemonNameCard}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.pokemonListContainer}
        onEndReached={handleEndReached} // Chama a função quando o final da lista for alcançado
        onEndReachedThreshold={0.5} // Define a distância antes de chamar a função
      />

      {/* Botão Carregar Mais */}
      {nextUrl && !loading && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={loadMorePokemons}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C6C9D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  loading: {
    marginTop: 16,
  },
  pokemonCard: {
    backgroundColor: '#2C6C9D',
    margin: 8,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    width: 100,
  },
  pokemonImageCard: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  pokemonNameCard: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pokemonDetailContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    marginBottom: 16, // Espaçamento entre os detalhes e a lista de Pokémons
  },
  pokemonDetailImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  pokemonDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pokemonDetailText: {
    fontSize: 16,
    marginBottom: 4,
  },
  pokemonListContainer: {
    marginBottom: 20,
  },
  loadMoreButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
