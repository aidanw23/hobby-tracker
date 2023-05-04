
import React, {useState} from 'react';
import Realm from "@realm/react";
import { createRealmContext } from "@realm/react";
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Boardgames from './components/pages/boardgames';
import Books from './components/pages/books';
import {DevTest} from './components/pages/devtestlist';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {Provider} from 'react-native-paper';

class realmBoardgame extends Realm.Object {
  static schema = {
    name: 'Boardgame',
    properties: {
      _id: 'int',
      name: { type: 'string', indexed: true },
      comments: 'string?',
      owned: 'bool',
      plays: {type: 'int', default: 0},
      rating: {type: 'int', default: 1},
      lastPlayed: 'string?',
    },
    primaryKey: '_id',
  }
}

const realmConfig = {
  schema: [realmBoardgame],
}

const {RealmProvider, useRealm, useObject, useQuery} = createRealmContext(realmConfig);


const Tab = createBottomTabNavigator();

export default function App() {
  
  return (
    <Provider>
    <RealmProvider>
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
    </RealmProvider>
    </Provider>
  );
}
