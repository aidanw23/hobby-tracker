
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Boardgames from './components/pages/boardgames';
import Books from './components/pages/books';
import { DevTest } from './components/pages/subcomponentsBG/devtest';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {Provider} from 'react-native-paper';

//NEW FROM DEVTEST
import { Session } from '@supabase/supabase-js';
import { View } from 'react-native';
import { supabase } from './supaback/supabase.js';
import { Auth } from './components/pages/login.js';
import { NetworkProvider, UserContext, NetworkContext } from './components/utils';
import NetInfo from '@react-native-community/netinfo';

const Tab = createBottomTabNavigator();

export default function App() {
  //Session and useEffect new
  const [session, setSession] = useState(null)
  const user = useContext(UserContext)
  const [isConnected, setIsConnected] = useState(false)
  const network = useContext(NetworkContext)

  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      console.log(`State connected: ${state.isConnected} Internet: ${state.isInternetReachable}`)
      const offline = (state.isConnected && state.isInternetReachable);
      console.log(offline)
      setIsConnected(offline)
    });

    return () => removeNetInfoSubscription();
}, []);

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
      <NetworkContext.Provider value = {isConnected}>
        <NavigationContainer>
            {session && session.user?
            <UserContext.Provider value = {session.user}>
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
            </UserContext.Provider>
            :
            <Auth />
            }
        </NavigationContainer>  
      </NetworkContext.Provider> 
    </Provider>
  );
}
