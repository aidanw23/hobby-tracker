import { StyleSheet, Text, View, Button, StatusBar, Pressable, FlatList } from 'react-native';
import React, {useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";



//Core main page containging navigators for all boardgame components
const BoardgamesStack = createNativeStackNavigator()

const DATA= []

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
        name="Adder"
        component={BoardgamesAdder}
      />
    </BoardgamesStack.Navigator>
  )
}


// List item for the flat list
const ListItem = ({name}) => {
    return (     
        <View style={styles.listItem}>
          <Text style={styles.listText}>{name}</Text>
        </View>
    )
}

//Main menu flatlist of all added boardgames
function BoardgamesList ({navigation}) {
  const [fullBG, setFullBG] = useState([{name:'test'},{name: 'test2'}])
  const [test, setTest] = useState()
  

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('boardgames')
      console.log(value)
      if(value !== null) {
        setFullBG(JSON.parse(value))
      }
      console.log(`FullBG is currently: ${JSON.stringify(fullBG)}`)
    } catch(e) {
      console.warn("Boardgame list not read")
      //NEEDS INITIAL SETUP???
    }
  }

  useEffect (() => {
    getData()
  },[test])
  
  
  const renderListItem = ({item}) => (
    <Pressable onPress = {() => {
        navigation.navigate('Details', {selected: item})
      }}>
      <ListItem name = {item.name} />
    </Pressable>
  )

  return (
    <View>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <Button  title = "Add" onPress={() => navigation.navigate('Adder', {all: fullBG})}/>

      <Button title = "Get from Async" onPress= {() => getData()} />
      <Button title= "console all games" onPress= {() => console.log(fullBG)} />
      <Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
      <FlatList 
          data = {fullBG} 
          renderItem = {renderListItem} 
      />
    </View>
  );
}

//details screen for when selecting a boardgame from the list, details are passed via route.params
function BoardgamesDetails ({route, navigation}) {
  const {selected} = route.params;
  useEffect(() => {console.log(`Details item is ${JSON.stringify(selected)}`)})
  return (
    <View>
      <View>
        <Text>{selected.name}</Text>
      </View>
      <View>
        <Text>Play count: {selected.plays}</Text>
        <Text>Last played: {selected.lastPlayed}</Text>
      </View>
    </View>
  )
}

//component rendered when user tries to add new game
function BoardgamesAdder ({route, navigation}) {

  let {all} = route.params
  const [ntitle, onChangeTitle] = React.useState("Title")
  const [nplays, onChangePlays] = React.useState("0")
  const [nrating, onChangeRating] =React.useState(0)
  const [nlastPlayed, setLastPlayed] = React.useState("Not set")

  const [isDatePickerVisible,setDatePickerVisibility] = useState(false)

  useEffect(() => {
    console.log('-----ADDER-----')
    console.log(`Full is now: ${JSON.stringify(all)}`)
    console.log(typeof all)
  }, [all])

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    setLastPlayed(date)
    hideDatePicker();
  };

  const storeGame = async () => {
    try {
      const newgame = {
        name: ntitle,
        plays: nplays,
        rating: nrating,
        comments: '',
        lastPlayed: nlastPlayed,
        owned: true
      }

      const combo = all.concat([newgame])
      const jsonValue = JSON.stringify(combo)
      console.log('New:')
      console.log(combo)
      await AsyncStorage.setItem('boardgames',jsonValue)
      navigation.navigate('List')
    } catch (e) {
      console.warn(`Error: ${e}`)
    }

  }

  return (
    <View>
      <Text>Add a new game</Text>
      <View>
        <Text>Title:</Text>
        <TextInput value={ntitle} onChangeText={onChangeTitle}/>
      </View>

      <Text>No. of plays:</Text>
      <TextInput value={nplays} onChangeText={onChangePlays}/>

      <Text>Rating:</Text>
      <Text>{nrating}</Text>
      <Slider 
        minimumValue={1}
        maximumValue={10}
        step={0.5}
        onValueChange={onChangeRating}
      />

      <Text>Last Played:</Text>
      <Pressable onPress={showDatePicker}>
        <Text>Please select date</Text>
      </Pressable>
      <Text>{JSON.stringify(nlastPlayed)}</Text>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <Button title = "Add game" onPress={storeGame}></Button>
    </View>
  )
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