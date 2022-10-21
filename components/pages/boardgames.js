import { StyleSheet, Text, View, Button, StatusBar, Pressable, FlatList, Switch } from 'react-native';
import React, {useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker"



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


// List item for the flat list
const ListItem = ({name, sort, rating, plays}) => {
  if (sort === 'none' || sort == null || sort == 'alphabetical') {
    return (     
      <View style={styles.listItem}>
        <Text style={styles.listText}>{name}</Text>
      </View>
    )
  } else if (sort == 'rating') {
    return  (
      <View style={styles.listItem}>
        <Text style={styles.listText}>{name}</Text>
        <Text>Rated: {rating}</Text>
      </View>
    )
  } else if (sort == 'most played') {
    return  (
      <View style={styles.listItem}>
        <Text style={styles.listText}>{name}</Text>
        <Text>Plays: {plays}</Text>
      </View>
    )
  }
  
}

//Main menu flatlist of all added boardgames
function BoardgamesList ({navigation}) {
  //full list of boardgames read from Async
  const [fullBG, setFullBG] = useState([])
  //search term entered
  const [search, setSearch] = useState('')
  //array of results using search
  const [searchList, setSearchList] = useState([])

  const [ddOpen, setDDOpen] = useState(false)
  const [ddValue, setDDValue] = useState(null)
  const [ddItems, setDDItems] = useState ([
    {label: '-', value: 'none'},
    {label:'Alphabetical', value: 'alphabetical'},
    {label:'Rating', value: 'rating'},
    {label: 'Most Played', value: 'most played'}
  ])

  const isFocused = useIsFocused()

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('boardgames')
      //console.log(value)
      if(value !== null) {
        setFullBG(JSON.parse(value))
      }
    } catch(e) {
      console.warn("Boardgame list not read")
    }
  }

  //autorefreshes page when its returned to for deleting or adding purposes
  useEffect (() => {
    getData()    
  },[isFocused])
  
  useEffect (() => {
    makeSearchList()
  },[ddValue])
  
  function makeSearchList () {
    console.log(search)
    let list = []
    if (search !== '') {
      const searchTerm = search.toUpperCase()
      for(const game of fullBG) {
        //console.log(game["name"])
        const nameCompare = game["name"].toUpperCase()
        if (nameCompare.includes(searchTerm)) {
          //console.log(`match between ${searchTerm} and ${game.name}`)
          list.push(game)
        }
      }
    } else {
      list = fullBG
    }
    sortList(list)
    setSearchList(list)
    getData()
    
  }

  function sortList (list) {
    let sortedList = list;
    switch (ddValue) {
      case 'none':
        break
      case 'alphabetical':
        sortedList.sort((a,b) => a.name.localeCompare(b.name))
        //console.log(`Alphabetised: ${JSON.stringify(sortedList)}`)
        break;
      case 'rating':
        sortedList.sort((a,b) => b.rating - a.rating)
        //console.log(`Rating: ${JSON.stringify(sortedList)}`)
        break;
      case 'most played':
        sortedList.sort((a,b) => b.plays - a.plays)
        //console.log(`Most Played: ${JSON.stringify(sortedList)}`)
    }
    return sortedList;
  }
  
  const renderListItem = ({item}) => (
    <Pressable onPress = {() => {
        navigation.navigate('Details', {selected: item})
      }}>
      <ListItem name = {item.name}  sort = {ddValue} rating = {item.rating} plays = {item.plays}/>
    </Pressable>
  )
//<Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
  return (
    <View style = {styles.listBG}>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <View>
        <Button  title = "Add" onPress={() => navigation.navigate('Adder', {all: fullBG})}/>
        <Button  title = "Quick Add" onPress={() => navigation.navigate('QuickAdder', {all: fullBG})}/>

        <Button title = "Refresh" onPress= {() => getData()} />
        <Button title = "Clear async" onPress = {() =>  AsyncStorage.clear()} />
        
      </View>
      <View>
        <DropDownPicker 
          open = {ddOpen}
          value = {ddValue}
          items = {ddItems}
          setOpen = {setDDOpen}
          setValue = {setDDValue}
          setItems = {setDDItems}
        />
      </View>
      <View>
        <TextInput placeholder='Search' style = {styles.searchBox} value = {search} onChangeText= {setSearch} onSubmitEditing = {makeSearchList}></TextInput>
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
    console.warn(JSON.stringify(date))
    let DTsplit = JSON.stringify(date).replace('"', '').split('T')
    let newDate = DTsplit[0].split('-')
    setEditable((prev) => ({...prev, lastPlayed: `${newDate[2]}/${newDate[1]}/${newDate[0]}`}))
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
    <View style = {styles.detailsView}>
      <View style = {styles.titleView}>
        <Text style ={styles.title}>{editable.name}</Text>
      </View>
      <View>

        <View style={styles.counterView}>
          <Text style= {styles.subtitle}>Play count:</Text>
          <Button title = "-" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays - 1}))}></Button>
          <Text style= {styles.subtitle}>{editable.plays}</Text>
          <Button title = "+" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays + 1}))}></Button>
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Last played: {editable.lastPlayed}</Text>
          <View style= {styles.dateButtonContainerContainer}>
            <View style = {styles.dateButtonContainer}>
              <Button title="Change date" onPress= {showDatePicker} ></Button>
            </View>
          </View>
          <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          />
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Rating: {editable.rating}</Text>
          <Slider 
          minimumValue={1}
          maximumValue={10}
          step={0.5}
          onValueChange={slideySlide}
          value={editable.rating}
          />
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Comments</Text>
          <TextInput value = {commentTemp} multiline = {true} onChangeText = {setCommentTemp} style = {styles.commentBox}></TextInput>
        </View>

        <View style = {styles.ownedView}>
          <Text style= {styles.subtitle}>Owned:</Text>
          <Switch value= {owned} onValueChange={toggleSwitch}></Switch>
        </View>
      </View>
      <View style={styles.saveContainer}>
        <Button title = 'Save' onPress={saveChanges}></Button>
      </View>
    </View>
  )
}

function QuickAdder ({route, navigation}) {

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
        <View styles={styles.qaButton}>
          <Button title = "Add game" onPress={storeGame}></Button>
        </View>
      </View>
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
    //DETAILS
    detailsView: {
      flex: 1,
      backgroundColor: '#fff'
    },
    title: {
      fontSize: 30,
      textShadowColor: '#bababa',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 5
    },
    titleView: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'whitesmoke',
      borderBottomColor: '#dedede',
      borderBottomWidth: 2,
    },
    subtitle: {
      fontSize:18,
      padding:6,
      marginLeft: 10
    },
    counterView: {
      flexDirection: 'row',
      paddingTop:10
    },
    commentBox: {
      fontsize:14,
      borderWidth: 1,
      borderColor: '#306935',
      margin: 5,
      padding: 5,
      backgroundColor: 'whitesmoke'
    },
    ownedView: {
      flexDirection: 'row',
    },
    dateContainer: {
      flexDirection: 'row'
    },
    dateButtonContainer: {
      width: '50%',
    },
    dateButtonContainer: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    basicView: {
      
    },
    saveContainer: {
      marginBottom: 40,
      backgroundColor: 'whitesmoke',
      borderBottomColor: '#cccccc',
      borderBottomWidth: 2,
    },

    toolbar: {
      flex: 1,
      justifyContent:'space-evenly',
      margin: 20,
    },
    //QUICK ADD
    qaView: {
      flex:1,
      justifyContent: 'center'
    },
    qaTitle: {
      textAlign: 'center',
      fontSize: 20,
      paddingTop: 20,
      paddingBottom: 20
    },
    qaInput: {
      fontSize: 18,
      borderWidth: 1,
      borderColor: '#306935',
      margin: 15,
      padding: 10,
      backgroundColor: 'whitesmoke'
    },
    qaButton:{
      width:'50%'
    },
    //LIST
    list:{
      borderColor:'#306935',
      borderWidth:1,
    },
    listBG: {
      backgroundColor: '#cfcfcf'
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
    searchBox: {
      fontsize:14,
      borderWidth: 1,
      borderColor: '#306935',
      margin: 5,
      padding: 5,
      backgroundColor: 'whitesmoke'
    },
    listButton: {
      backgroundColor: '#fff',
      borderColor: '#949494',
      color: '#949494',
    }
  });