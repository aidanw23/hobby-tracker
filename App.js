
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#306935',
    height: 50,
    paddingLeft: 40,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
  },
  toolbar: {
    flex: 1,
    justifyContent:'space-evenly',
    margin: 20,
  },
  list:{
    borderColor:'#306935',
    borderWidth:1,
  },
  listItem:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',

    height: 60,
    margin: 5,
    padding: 10,

    backgroundColor:'#fff',
    borderColor: '#306935',
    borderWidth: 1,
  },
  listText: {
    fontSize: 16,
  },
  listButton: {
    backgroundColor: '#fff',
    borderColor: '#949494',
    color: '#949494',
  }
});
