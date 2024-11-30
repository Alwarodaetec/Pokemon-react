import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, TouchableNativeFeedback } from 'react-native';

const { width, height } = Dimensions.get('window'); // Captura a largura e altura da tela

const App = () => {
  const [pokemonName, setPokemonName] = useState('');
  const [selectedPokemon1, setSelectedPokemon1] = useState(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState(null);
  const [error, setError] = useState('');
  const [pokedex, setPokedex] = useState([]);
  const [battleResult, setBattleResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPokedex = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50');
        const data = await response.json();

        const pokedexWithSprites = await Promise.all(
          data.results.map(async (pokemon) => {
            const pokemonDetails = await fetch(pokemon.url).then((res) => res.json());
            return { name: pokemon.name, sprite: pokemonDetails.sprites.front_default, url: pokemon.url, abilities: pokemonDetails.abilities };
          })
        );

        setPokedex(pokedexWithSprites);
      } catch (err) {
        console.error('Error fetching Pokédex:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokedex();
  }, []);

  // Função para buscar Pokémon
  const fetchPokemon = async (pokemonUrl) => {
    try {
      setLoading(true);
      const response = await fetch(pokemonUrl || `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Pokémon not found');
      }
      const data = await response.json();
      setError(''); // Limpar erro ao buscar o Pokémon
      setPokemonName(''); // Limpar campo de pesquisa
      if (!selectedPokemon1) {
        setSelectedPokemon1(data);
      } else if (!selectedPokemon2) {
        setSelectedPokemon2(data);
      }
    } catch (err) {
      setError('Pokémon not found');
    } finally {
      setLoading(false);
    }
  };

  // Função para batalhar os dois Pokémon selecionados
  const handleBattle = () => {
    if (selectedPokemon1 && selectedPokemon2) {
      const statSum1 = selectedPokemon1.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
      const statSum2 = selectedPokemon2.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

      if (statSum1 > statSum2) {
        setBattleResult(`${selectedPokemon1.name.toUpperCase()} WINS!`);
      } else if (statSum1 < statSum2) {
        setBattleResult(`${selectedPokemon2.name.toUpperCase()} WINS!`);
      } else {
        setBattleResult('IT\'S A TIE!');
      }
    } else {
      setBattleResult('Please select both Pokémon.');
    }
  };

  // Função para remover Pokémon da batalha
  const handleRemovePokemon = (pokemonNum) => {
    if (pokemonNum === 1) {
      setSelectedPokemon1(null);
    } else if (pokemonNum === 2) {
      setSelectedPokemon2(null);
    }
    setBattleResult(''); // Limpar o resultado da batalha após remover Pokémon
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokémon Battle</Text>

      {/* Barra de Pesquisa */}
      <TextInput
        style={styles.input}
        placeholder="Enter Pokémon name or ID"
        value={pokemonName}
        onChangeText={setPokemonName}
      />
      <TouchableNativeFeedback onPress={() => fetchPokemon()}>
        <View style={styles.searchButton}>
          <Text style={styles.buttonText}>Search Pokémon</Text>
        </View>
      </TouchableNativeFeedback>
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Exibe Pokémon Selecionados */}
      <View style={styles.selectedPokemons}>
        {selectedPokemon1 && (
          <View style={styles.pokemonCard}>
            <Text style={styles.pokemonName}>
              {selectedPokemon1.name.charAt(0).toUpperCase() + selectedPokemon1.name.slice(1)}
            </Text>
            <Image
              source={{ uri: selectedPokemon1.sprites.front_default }}
              style={styles.pokemonImage}
            />
            <TouchableNativeFeedback onPress={() => handleRemovePokemon(1)}>
              <View style={styles.removeButton}>
                <Text style={styles.buttonText}>Remover</Text>
              </View>
            </TouchableNativeFeedback>

            {/* Exibe as habilidades do Pokémon */}
            <View style={styles.abilitiesContainer}>
              <Text style={styles.abilitiesTitle}>Habilidades:</Text>
              {selectedPokemon1.abilities.map((ability, index) => (
                <Text key={index} style={styles.abilityText}>
                  {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                </Text>
              ))}
            </View>
          </View>
        )}

        {selectedPokemon2 && (
          <View style={styles.pokemonCard}>
            <Text style={styles.pokemonName}>
              {selectedPokemon2.name.charAt(0).toUpperCase() + selectedPokemon2.name.slice(1)}
            </Text>
            <Image
              source={{ uri: selectedPokemon2.sprites.front_default }}
              style={styles.pokemonImage}
            />
            <TouchableNativeFeedback onPress={() => handleRemovePokemon(2)}>
              <View style={styles.removeButton}>
                <Text style={styles.buttonText}>Remover</Text>
              </View>
            </TouchableNativeFeedback>

            {/* Exibe as habilidades do Pokémon */}
            <View style={styles.abilitiesContainer}>
              <Text style={styles.abilitiesTitle}>Habilidades:</Text>
              {selectedPokemon2.abilities.map((ability, index) => (
                <Text key={index} style={styles.abilityText}>
                  {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Botão para Iniciar Batalha */}
      {selectedPokemon1 && selectedPokemon2 && (
        <TouchableNativeFeedback onPress={handleBattle}>
          <View style={styles.battleButton}>
            <Text style={styles.buttonText}>Batalhar!</Text>
          </View>
        </TouchableNativeFeedback>
      )}
      {battleResult && <Text style={styles.result}>{battleResult}</Text>}

      {/* Pokédex */}
      <Text style={styles.pokedexTitle}>Pokédex</Text>
      <FlatList
        data={pokedex}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => fetchPokemon(item.url)}>
            <Image source={{ uri: item.sprite }} style={styles.pokedexImage} />
          </TouchableOpacity>
        )}
        numColumns={Math.floor(width / 120)} // Ajusta o número de colunas dinamicamente
        columnWrapperStyle={styles.pokedexRow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C6C9D',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#2C6C9D',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  removeButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  battleButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedPokemons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  pokemonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    width: width * 0.4, // Ajuste para o tamanho da carta
  },
  pokemonImage: {
    width: 100,
    height: 100,
    marginTop: 12,
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C6C9D',
  },
  abilitiesContainer: {
    marginTop: 12,
  },
  abilitiesTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2C6C9D',
  },
  abilityText: {
    fontSize: 14,
    color: '#333',
  },
  result: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFD700',
  },
  pokedexTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#2C6C9D',
  },
  pokedexImage: {
    width: 80,
    height: 80,
    margin: 8,
  },
  pokedexRow: {
    justifyContent: 'space-evenly',
  },
});

export default App;
