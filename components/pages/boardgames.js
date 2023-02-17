import { ScrollView, Text, Animated, View, Button, StatusBar, Pressable, FlatList, Switch, Alert, Image } from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from 'expo-image-picker';
import {styles} from './styles.js'



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
const ListItem = ({name, sort, rating, plays, lastPlayed}) => {
  if (sort === 'none' || sort == null || sort == 'alphabetical') {
    return (     
      <View style={styles.listItem}>
        <Text style={styles.listText} numberOfLines = {1} ellipsizeMode ='tail' >{name}</Text>
      </View>
    )
  } else if (sort == 'rating') {
    return  (
      <View style={styles.listItem}>
        <View style={styles.narrowInfoListView}>
          <Text style={styles.listText} numberOfLines = {1} ellipsizeMode ='tail'>{name}</Text>
        </View>
        <Text style = {styles.listAttribute}>Rated: {rating}</Text>
      </View>
    )
  } else if (sort == 'most played') {
    return  (
      <View style={styles.listItem}>
        <View style = {styles.narrowInfoListView}>
          <Text style={styles.listText} numberOfLines = {1} ellipsizeMode ='tail'>{name}</Text>
        </View>
        <Text>Plays: {plays}</Text>
      </View>
    )
  } else if (sort == 'last played') {
    return  (
      <View style={styles.listItem}>
        <View style = {styles.narrowInfoListView}>
          <Text style={styles.listText} numberOfLines = {1} ellipsizeMode ='tail'>{name}</Text>
        </View>
        <Text>{lastPlayed}</Text>
      </View>
    )
  }
}

//Main menu flatlist of all added boardgames
function BoardgamesList ({navigation}) {
  //full list of boardgames and tags read from Async
  const [fullBG, setFullBG] = useState([])
  const [bgTags, setBGTags] = useState([])
  //search term entered
  const [search, setSearch] = useState('')
  //array of results using search
  const [searchList, setSearchList] = useState([])
  const [fadeAnim] = useState(new Animated.Value(0));
  const [shouldFade, setShouldFade] = useState(false)
  const [ddOpen, setDDOpen] = useState(false)
  const [ddValue, setDDValue] = useState(null)
  const [ddItems, setDDItems] = useState ([
    {label: '-', value: 'none'},
    {label:'Last Played', value: 'last played'},
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
      console.warn("Boardgame list not read from local storage")
    }
    try {
      const tags = await AsyncStorage.getItem('bgtags')

      if (tags !== null) {
        setBGTags(JSON.parse(tags))
      }
    } catch (e) {
      console.warn("Error reading tags from local storage")
    }
  }

  //autorefreshes page when its returned to for deleting or adding purposes
  useFocusEffect (
    useCallback(() => {
      getData()
      setSearch('')
      setSearchList([])
      //setDDValue(null) 
    },[isFocused])
  )
  
  //sorts list when dropdown option is selected
  useEffect (() => {
    fadeAnim.setValue(0)
    setShouldFade(true)
    makeSearchList()
    //getData()
  },[ddValue])
  

  //if fullBG is changed it'll update the search list, this lets it update right away when deets are edited
  useEffect (() => {
    makeSearchList()
  },[fullBG])

  useEffect(() => {
    //console.log("searchList effect should fire")
    fadeAnim.setValue(0)
    setShouldFade(true)
  }, [searchList]);

  //useeffect based around shouldFade, used to make main list fade iif ddvalue or search term changes
  useEffect(() => {
    if(shouldFade == true) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setShouldFade(false)
    }
  }, [shouldFade])

  //makeSearchList is a function called when a search term is entered or a ddvalue is set
  //if a search term is set it will find matching terms in name and add it to a list
  //if no match is found it creates an alert to let user know
  //then if sort is set, sorts list accordingly using sortList function
  async function makeSearchList () {
    //console.log(`Making Search list from ${JSON.stringify(fullBG)}`)
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

    if(ddValue !== 'none'|| ddValue !== null) {
      if (list.length == 0) {
        list = fullBG
      }
      list = sortList(list)
    }
    setSearchList(list)
  }

  //function containing switch case matching sorted value to a sort for the list
  //called as part of the make search list function above
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
        break;
      case 'last played':
        sortedList.sort(function (a,b) {
          var aSplit = a.lastPlayed.split('/')
          var bSplit = b.lastPlayed.split('/')
          return new Date(bSplit[2],bSplit[1]-1,bSplit[0]) -  new Date(aSplit[2],aSplit[1]-1,aSplit[0])
        })
        //console.log(`last played: ${JSON.stringify(sortedList)}`)
    }
    return sortedList;
  }
  
  //render function for list items in the main list
  const renderListItem = ({item}) => (
    <Pressable onPress= {() => {
        navigation.navigate('Details',{selected: item})
      }}
      onLongPress = {() => {}}>
      <ListItem name = {item.name}  sort = {ddValue} rating = {item.rating} plays = {item.plays} lastPlayed = {item.lastPlayed}/>
    </Pressable>
  )

//<Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
  return (
    <View style = {styles.list}>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <View style = {styles.listHeader}>
        <Pressable style = {styles.addButton} onPress={() => navigation.navigate('QuickAdder', {all: fullBG})}> 
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
            placeholder="Sort list..."
          />
        </View>
        <View style = {styles.searchContainer}>
          <TextInput placeholder='Search' 
            contentStyle = {styles.searchBox} outlineStyle={styles.searchOuter} selectionColor='#81a688'
            value = {search} 
            onChangeText= {setSearch} onSubmitEditing = {makeSearchList}
            mode = 'outlined'
            >
          </TextInput>
        </View>
      </View>
      <View style = {styles.flatListContainer}>
        {searchList.length > 0 ? 
        <Animated.View style={{opacity: fadeAnim,}}>
          <FlatList 
            data = {searchList} 
            extraData = {searchList}
            renderItem = {renderListItem} 
          />
        </Animated.View>
        :
        <Animated.View style={{opacity: fadeAnim,}}>
          <FlatList 
              data = {fullBG} 
              extraData = {fullBG}
              renderItem = {renderListItem} 
          />
        </Animated.View>
        }   
      </View>
    </View>
  );
}


//details screen for when selecting a boardgame from the list, details are passed via route.params
function BoardgamesDetails ({route, navigation}) {
  //selected: game object passed via nav route
  const {selected} = route.params;
  //editable is a copy of the selected game which will be changed up as user edits details
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
    //console.warn(JSON.stringify(date))
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

  async function deleteGame (){
    const fullBG = await AsyncStorage.getItem('boardgames');
    let parsedBG = JSON.parse(fullBG);
    let newBG = []
    for (let i = 0; i < parsedBG.length; i ++) {
      if (parsedBG[i].name !== editable.name) {
        newBG.push(parsedBG[i])
      } else {
        console.log(`Matching entry removed: ${parsedBG[i].name}`)
      }
    }
    const stringed = JSON.stringify(newBG)
    AsyncStorage.setItem('boardgames', stringed)
    navigation.goBack()   
  }

  function deleteAlert () {
    Alert.alert(
      "Are you sure?",
      "Deleting a game can not be undone!",
      [
        {
          text: 'No, go back',
          onPress: () => console.warn("Deletion cancelled")
        },
        {
          text: "Yes, I'm sure",
          onPress: () => deleteGame()
        }
      ]
    )
  }

  return (
    <ScrollView style = {styles.detailsPage}>
      <View style = {styles.detailsView}>
          <View style = {styles.deleteBar}>
            <Pressable onPress = {deleteAlert}>
              <Image style = {styles.bin} source = {require('../../assets/binning.png')} /> 
            </Pressable>
          </View>
        <View style = {styles.titleView}>
          <Text style ={styles.title}>{editable.name}</Text>
        </View>
        <View style = {styles.imageView}>
          {editable.image ? 
          <Pressable onPress={addImage}>
            <Image source = {{uri: editable.image}} style = {styles.detailsImage} resizeMode='contain' ></Image>
          </Pressable>
          :
          <View style = {styles.imageButton}>
            <Button color ='#306935' title = 'Add an image' onPress={addImage} style = {styles.imageButton}></Button>
          </View>
          }
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
          <Text style= {styles.subtitle}>Thoughts and notes:</Text>
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
