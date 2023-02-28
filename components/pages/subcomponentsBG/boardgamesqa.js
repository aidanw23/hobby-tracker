import { Text, View, } from 'react-native';
import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native-paper';
import {styles} from '../styles.js'


export function QuickAdder ({route, navigation}) {

  let {all} = route.params;
  const [name, setName] = useState('')

  const storeGame = async () => {
    console.log(`Adding ${name}`)
    try {
      const newgame = {
        name: name,
        plays: 0,
        rating: 1,
        comments: '',
        lastPlayed: 'Not set',
        owned: true
      }

      const combo = all.concat([newgame])
      console.log(combo)
      console.table(combo)
      const jsonValue = JSON.stringify(combo)
      await AsyncStorage.setItem('boardgames',jsonValue)
      navigation.navigate('List')

    } catch (e) {
      console.warn(`Error: ${e}`)
    }
  }

  return (
    <View style = {styles.qaView}>
      <View >
        <Text style= {styles.qaTitle}> What is the name of your new game?</Text>
      </View>
      <View>
        <TextInput value = {name} onChangeText = {setName} style = {styles.qaInput}></TextInput>
        <View style = {styles.qaButtonView}>
          <Button style={styles.qaButton} onPress={storeGame} buttonColor ='#306935' title = 'Add game'/>
        </View>
      </View>
    </View>
  )
}