
import React, { useState, useEffect } from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Boardgames from './components/pages/boardgames';
import Books from './components/pages/books';
import { DevTest } from './components/pages/subcomponentsBG/devtest';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {Provider} from 'react-native-paper';

//NEW FROM DEVTEST
import { Session } from '@supabase/supabase-js'
import { View } from 'react-native'
import { supabase } from './supaback/supabase.js'
import { Auth } from './components/pages/login.js'


const Tab = createBottomTabNavigator();

export default function App() {
  //Session and useEffect new
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Provider>
      <NavigationContainer>
        {session && session.user?
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
        :
        <Auth />
        }
      </NavigationContainer>

    </Provider>
  );
}
