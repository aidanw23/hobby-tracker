
import React, {useState} from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Boardgames from './components/pages/boardgames';
import Books from './components/pages/books';
import {DevTest} from './components/pages/devtest';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {Provider} from 'react-native-paper';


const Tab = createBottomTabNavigator();

export default function App() {
  
  return (
    <Provider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{headerShown:false, tabBarActiveTintColor: '#306935'}}>
          <Tab.Screen 
            name = 'Boardgames'
            component={Boardgames}
            options= {{
              tabBarIcon: ({color,size}) => (
                <FontAwesome5 name="chess-pawn" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name = 'Books'
            component={Books}
            options= {{
              tabBarIcon: ({color,size}) => (
                <MaterialCommunityIcons name="book-open-blank-variant" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name = 'devTest'
            component={DevTest}
            options= {{
              tabBarIcon: ({color,size}) => (
                <MaterialCommunityIcons name="book-open-blank-variant" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
