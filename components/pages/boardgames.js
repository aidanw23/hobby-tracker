import { StyleSheet, Text, View, Button, StatusBar, Pressable, FlatList, Switch } from 'react-native';
import React, {useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";



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
  //full list of boardgames read from Async
  const [fullBG, setFullBG] = useState([])
  //search term entered
  const [search, setSearch] = useState()
  //array of results using search
  const [searchList, setSearchList] = useState([])
  
  const isFocused = useIsFocused()

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
    }
  }

  //autorefreshes page when its returned to for deleting or adding purposes
  useEffect (() => {
    console.log(searchList)
    if (isFocused) {
      getData()  
    }
  },[isFocused])
  
  function makeSearchList () {
    console.log(`Searching for `)
    if (search === null || search !== '') {
      const searchTerm = search.toUpperCase()
      const list = []
      for(const game of fullBG) {
        console.log(game["name"])
        const nameCompare = game["name"].toUpperCase()
        if (nameCompare.includes(searchTerm)) {
          console.log(`match between ${searchTerm} and ${game.name}`)
          list.push(game)
        }
      }
      setSearchList(list)
      console.log(`Searchlist: ${JSON.stringify(list)}`)
    } else {
      console.log("no search")
      setSearchList([])
    }
  }
  
  const renderListItem = ({item}) => (
    <Pressable onPress = {() => {
        navigation.navigate('Details', {selected: item})
      }}>
      <ListItem name = {item.name} />
    </Pressable>
  )
//<Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
  return (
    <View>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <View>
        <Button  title = "Add" onPress={() => navigation.navigate('Adder', {all: fullBG})}/>

        <Button title = "Refresh" onPress= {() => getData()} />
        <Button title = "Clear async" onPress = {() =>  AsyncStorage.clear()} />
        
      </View>
      <View>
        <TextInput value = {search} onChangeText= {setSearch} onSubmitEditing = {makeSearchList}></TextInput>
      </View>
      {searchList.length > 0 ? 
      <FlatList 
        data = {searchList} 
        renderItem = {renderListItem} 
      />
      :
      <FlatList 
          data = {fullBG} 
          renderItem = {renderListItem} 
      />
      }   
    </View>
  );
}


//details screen for when selecting a boardgame from the list, details are passed via route.params
function BoardgamesDetails ({route, navigation}) {
  //selected: game object passed via
  const {selected} = route.params;
  const [editable, setEditable] = useState(selected);
  const [commentTemp, setCommentTemp] = useState(editable.comments)
  const [owned, setOwned] = useState (editable.owned)
  //bool used for date picker
  const [isDatePickerVisible,setDatePickerVisibility] = useState(false)

  //the two use effects below are to update editable when states change used for inputs
  useEffect(() => {
    setEditable((prev) => ({...prev, comments: commentTemp}))
  }, [commentTemp])

  useEffect(() => {
    setEditable(prev => ({...prev, owned: owned}))
  },[owned])

  //following functions are for components eg. date picker, toggle switch etc.
  const toggleSwitch = () => {
    setOwned(previousState => !previousState);
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    //console.warn("A date has been picked: ", date);
    setEditable((prev) => ({...prev, lastPlayed: date}))
    hideDatePicker();
  };

  function slideySlide (value) {
    setEditable(prev => ({...prev, rating: value}))
  }

  //function called when save button is hit to replace whatever entry exists for name with editable that contains changes
  async function saveChanges () {
    try {
      setEditable((prev) => ({...prev, comments: commentTemp}))
      console.log(`comment should be: ${commentTemp}`)
      const fullBG = await AsyncStorage.getItem('boardgames')
      let savingFullBG = JSON.parse(fullBG)
      for (let i = 0; i < savingFullBG.length; i ++) {
        if (savingFullBG[i].name === editable.name) {
          console.log(`Match found: ${JSON.stringify(savingFullBG[i])}`)
          console.log(`Making it: ${JSON.stringify(editable)}`)
          savingFullBG[i] = editable;
        }
      }
      const stringed = JSON.stringify(savingFullBG)
      AsyncStorage.setItem('boardgames', stringed)
      navigation.goBack()
    } catch (e) {
      console.log(`Error saving changes: ${e}`)
    }
  }

  return (
    <View>
      <View>
        <Text>{editable.name}</Text>
      </View>
      <View>

        <View>
          <Text>Play count:</Text>
          <Button title = "-" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays - 1}))}></Button>
          <Text>{editable.plays}</Text>
          <Button title = "+" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays + 1}))}></Button>
        </View>

        <View>
          <Text>Last played: {JSON.stringify(editable.lastPlayed)}</Text>
          <Button title="Change date" onPress= {showDatePicker}></Button>
          <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          />
        </View>

        <View>
          <Text>Rating: {editable.rating}</Text>
          <Slider 
          minimumValue={1}
          maximumValue={10}
          step={0.5}
          onValueChange={slideySlide}
          value={editable.rating}
          />
        </View>

        <View>
          <Text>Comments</Text>
          <TextInput value = {commentTemp} multiline = {true} onChangeText = {setCommentTemp}></TextInput>
        </View>

        <View>
          <Text>Owned:</Text>
          <Switch value= {owned} onValueChange={toggleSwitch}></Switch>
        </View>
      </View>
      <Button title = 'Save' onPress={saveChanges}></Button>
    </View>
  )
}

//page rendered when user tries to add new game
function BoardgamesAdder ({route, navigation}) {

  // all contains the full list of boardgames, so the new can be added to it and the new list overwrite its
  let {all} = route.params
  //stateful properties edited by user and saved as new game
  const [ntitle, onChangeTitle] = React.useState("Title")
  const [nplays, onChangePlays] = React.useState("0")
  const [nrating, onChangeRating] =React.useState(0)
  const [nlastPlayed, setLastPlayed] = React.useState("Not set")
  const [ncomments, setComments] = React.useState("")
  //bool used for date picker
  const [isDatePickerVisible,setDatePickerVisibility] = useState(false)

  /* old use effect for tracking the passed  list
  useEffect(() => {
    console.log('-----ADDER-----')
    console.log(`Full is now: ${JSON.stringify(all)}`)
    console.log(typeof all)
  }, [all])
  */

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    //console.warn("A date has been picked: ", date);
    setLastPlayed(date)
    hideDatePicker();
  };
  //function called to save properties using async storage and then navigate user out of adder
  const storeGame = async () => {
    try {
      const newgame = {
        name: ntitle,
        plays: nplays,
        rating: nrating,
        comments: ncomments,
        lastPlayed: nlastPlayed,
        owned: true
      }

      const combo = all.concat([newgame])
      const jsonValue = JSON.stringify(combo)
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

      <Text>Comments:</Text>
      <TextInput value={ncomments} onChangeText={setComments}/>

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