import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ListaDeHabilidades from './components/ListaDeHabilidades.js';  // Importando a tela de lista
import BatalhaPokemons from './components/BatalhaPokemons.js';
import Inicial from './components/Inicial';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicial">
        <Stack.Screen name="Inicial" component={Inicial} options={{ title: 'Inicial' }} />
        <Stack.Screen name="ListaDeHabilidades" component={ListaDeHabilidades} options={{ title: 'Explorador de Habilidades' }} />
        <Stack.Screen name="BatalhaPokemons" component={BatalhaPokemons} options={{ title: 'Batalha dos Pokemons' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
