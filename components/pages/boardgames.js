import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { QuickAdder } from './subcomponentsBG/boardgamesqa.js';
import { BoardgamesList } from './subcomponentsBG/boardgameslist.js';
import { BoardgamesDetails } from './subcomponentsBG/boardgamesdetails.js';

//Core main page containging navigators for all boardgame components
const BoardgamesStack = createNativeStackNavigator()

export default function Boardgames () {
  return (
    <BoardgamesStack.Navigator initialRouteName='List' screenOptions={{headerShown:false}}>
      <BoardgamesStack.Screen 
        name="List"
        component={BoardgamesList}
      />
      <BoardgamesStack.Screen 
        name="Details"
        component={BoardgamesDetails}
      />
      <BoardgamesStack.Screen 
        name="QuickAdder"
        component={QuickAdder}
      />
    </BoardgamesStack.Navigator>
  )
}
