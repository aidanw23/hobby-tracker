
import { StyleSheet, Text, View, Button, StatusBar, Pressable, FlatList } from 'react-native';
import React, {useState} from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Boardgames from './components/pages/boardgames';
import VideoGames from './components/pages/videogames';
import Books from './components/pages/books';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{headerShown:false}}>
        <Tab.Screen 
          name = 'Boardgames'
          component={Boardgames}
        />
        <Tab.Screen 
          name = 'Video Games'
          component={VideoGames}
        />
        <Tab.Screen 
          name = 'Books'
          component={Books}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
