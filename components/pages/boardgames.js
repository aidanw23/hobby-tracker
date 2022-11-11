import { ScrollView, StyleSheet, Text, View, Button, StatusBar, Pressable, FlatList, Switch, Alert, Image } from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from 'expo-image-picker';



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
  useFocusEffect (
    useCallback(() => {

      getData()
      setSearch('')
      setSearchList([])
    },[isFocused])
  )
  //sorts list when dropdown option is selected
  useEffect (() => {
    makeSearchList()
    getData()
  },[ddValue])
  
  
  function makeSearchList () {
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
      list = []
    }
    if (list.length === 0 && search !== '') {
      Alert.alert(
        "No results",
        "No matching titles were found in your collection!",
        [
          {
            text: 'OK'
          }
        ]
      )
    }
    if(ddValue !== 'none') {
      if (list.length == 0) {
        list = fullBG
      }
      sortList(list)
    }
    setSearchList(list)
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
    <Pressable onPress= {() => {
        navigation.navigate('Details',{selected: item})
      }}
      onLongPress = {() => {}}>
      <ListItem name = {item.name}  sort = {ddValue} rating = {item.rating} plays = {item.plays}/>
    </Pressable>
  )
//<Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
  return (
    <View style = {styles.listBG}>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <View style = {styles.listHeader}>
        <Pressable style = {styles.addGameButton} onPress={() => navigation.navigate('QuickAdder', {all: fullBG})}> 
            <Text style = {styles.headerText}>+</Text>
        </Pressable>
      </View>
      <View style = {styles.searchAndSortContainer}>
        <View style = {styles.sortContainer}>
          <DropDownPicker 
            open = {ddOpen}
            value = {ddValue}
            items = {ddItems}
            setOpen = {setDDOpen}
            setValue = {setDDValue}
            setItems = {setDDItems}
          />
        </View>
        <View style = {styles.searchContainer}>
          <TextInput placeholder='Search' style = {styles.searchBox} value = {search} onChangeText= {setSearch} onSubmitEditing = {makeSearchList}></TextInput>
        </View>
      </View>
      <View style = {styles.flatListContainer}>
        {searchList.length > 0 ? 
        <FlatList 
          data = {searchList} 
          extraData = {searchList}
          renderItem = {renderListItem} 
        />
        :
        <FlatList 
            data = {fullBG} 
            extraData = {fullBG}
            renderItem = {renderListItem} 
        />
        }   
      </View>
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
  const [imageURI, setImageURI] = useState (editable.image)

  //the two use effects below are to update editable when states change used for inputs
  useEffect(() => {
    setEditable((prev) => ({...prev, comments: commentTemp}))
  }, [commentTemp])

  useEffect(() => {
    setEditable(prev => ({...prev, owned: owned}))
  },[owned])

  useEffect (() => {
    setEditable(prev => ({...prev, image: imageURI}))
  }, [imageURI])

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

  async function addImage () {
    let result = await ImagePicker.launchImageLibraryAsync({
    })
    console.log(result.uri)
    if (!result.cancelled) {
      setImageURI(result.uri);
    }
  }

  //function called when save button is hit to replace whatever entry exists for name with editable that contains changes
  async function saveChanges () {
    try {
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

  function testPress (){
    console.warn('It worked')
  }

  return (
    <ScrollView style = {styles.detailsPage}>
      <View style = {styles.detailsView}>
          <View style = {styles.deleteBar}>
            <Pressable onPress = {deleteGame}>
              <Image style = {styles.bin} source = {require('../../assets/binning.png')} /> 
            </Pressable>
          </View>
        <View style = {styles.titleView}>
          <Text style ={styles.title}>{editable.name}</Text>
        </View>
        <View style = {styles.imageView}>
          {editable.image? 
          <Pressable onPress={addImage}>
            <Image source = {{uri: editable.image}} style = {styles.detailsImage} resizeMode='contain' ></Image>
          </Pressable>
          :
          <Button color ='#306935' title = 'Add an image' onPress={addImage}></Button>}
        </View>
      <View>
        <View style={styles.counterView}>
          <Text style= {styles.subtitle}>Play count:</Text>
          <Button color ='#306935' title = "-" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays - 1}))}></Button>
          <Text style= {styles.subtitle}>{editable.plays}</Text>
          <Button color ='#306935' title = "+" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays + 1}))}></Button>
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Last played: {editable.lastPlayed}</Text>
          <View style= {styles.dateButtonContainerContainer}>
            <View style = {styles.dateButtonContainer}>
              <Button color ='#306935' title="Change date" onPress= {showDatePicker} ></Button>
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
        <Button color ='#306935' title = 'Save' onPress={saveChanges}></Button>
      </View>
    </View>
  </ScrollView>
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
        <View style = {styles.qaButtonView}>
          <Button style={styles.qaButton} onPress={storeGame} color ='#306935' title = 'Add game'/>
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
    detailsPage: {
      flex: 1,
    },
    detailsView: {
      flex: 1,
      backgroundColor: '#fff'
    },
    deleteBar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#E9E9E9'
    },
    bin: {
      height:30,
      width:30,
      margin: 10
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
      paddingLeft: 30 ,
      paddingRight: 30 ,
      paddingBottom: 30 ,
      backgroundColor: '#E9E9E9',
      borderBottomColor: '#dedede',
      borderBottomWidth: 2,
    },
    subtitle: {
      fontSize:18,
      padding:6,
      marginLeft: 10
    },
    imageView: {
      alignItems:'center',
      justifyContent:'center'
    },
    detailsImage: {
      width: '90%',
      aspectRatio: 1
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
      marginBottom: 20,
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
    qaButtonView: {
      justifyContent: 'center',
      alignItems: 'center',
      height: '20%'
    },
    qaButton:{
      width:'50%',
      height:'100%'
    },
    qaButtonText: {

    },
    
    //LIST
    list:{
      borderColor:'#306935',
      borderWidth:1,
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      height: '10%',
      width: '100%',
      backgroundColor: '#306935',
      marginBottom: 20,
    },
    addGameButton: {
      width: '20%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    headerText: {
      color: '#ffffff',
      fontSize: 25
    },
    searchAndSortContainer: {
      flexDirection: 'row',
      paddingBottom: 10
    },
    searchContainer: {
      width: '60%',
      flexGrow:4
    },
    sortContainer: {
      width: '35%',
      flexGrow:1
    },
    listBG: {
      backgroundColor: '#cfcfcf',
      height: '100%'
    },  
    listItem:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems:'center',
  
      height: 60,
      margin: 0,
      padding: 10,
  
      backgroundColor:'#fff',
      borderTopColor: '#cfcfcf',
      borderTopWidth: 1,
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
    flatListContainer:{
      height:'80%',
      borderBottomColor: '#306935',
      borderBottomWidth: 0
    },
    listButton: {
      backgroundColor: '#fff',
      borderColor: '#949494',
      color: '#949494',
    }
  });