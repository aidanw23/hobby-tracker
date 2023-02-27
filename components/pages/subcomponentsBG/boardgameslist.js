import { Text, Animated, View, StatusBar, Pressable, FlatList, SectionList, Alert } from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Dialog, Button, Portal } from 'react-native-paper';
import DropDownPicker from "react-native-dropdown-picker";
import {styles} from '../styles.js'


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
export function BoardgamesList ({navigation}) {

  //full list of boardgames and tags read from Async
  const [fullBG, setFullBG] = useState([])
  const [bgTags, setBGTags] = useState([])

  //search term entered to search list
  
  const [selection, setSelection] = useState()

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

  //getdata - async function that reads local storage for stored boardgames and tags
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
      setSearchList([])
      //setDDValue(null) 
    },[isFocused])
  )
  
  //sorts list when dropdown option is selected
  useEffect (() => {
    fadeAnim.setValue(0)
    setShouldFade(true)
    //getData()
  },[ddValue])
  

  useEffect(() => {
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

  function handleFilterSelection (selection) {
    setSelection(selection)
  }

  function handleSearchChange (list) {
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

      {/* SEARCH AND SORT*/}
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
        <SearchBar onChange = {handleSearchChange} fullList = {fullBG} sortType = {ddValue}/>
        <View>
          <FilterSelection onChange = {handleFilterSelection} tags = {bgTags}/>
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


//props for search bar are: sortType (=ddValue), fullList (=fullBG or books), sortType (=ddValue)
function SearchBar (props) {
  const [search, setSearch] = useState('')

  //if fullBG is changed it'll update the search list, this lets it update right away when deets are edited
  useEffect (() => {
    makeSearchList()
  },[props.fullList, props.sortType])

  //makeSearchList is a function called when a search term is entered or a ddvalue is set
  //if a search term is set it will find matching terms in name and add it to a list
  //if no match is found it creates an alert to let user know
  //then if sort is set, sorts list accordingly using sortList function
  async function makeSearchList () {
    let list = []
    if (search !== '') {
      const searchTerm = search.toUpperCase()
      for(const game of props.fullList) {
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

    props.onChange(list)
  }

  return (
    <View style = {styles.searchContainer}>
      <TextInput placeholder='Search' 
        contentStyle = {styles.searchBox} outlineStyle={styles.searchOuter} selectionColor='#81a688'
        value = {search} 
        onChangeText= {setSearch} onSubmitEditing = {makeSearchList}
        mode = 'outlined'
      >
      </TextInput>
    </View>
  )
}

//checkbox for tags
//radiobutton for sorts?
function FilterSelection (props) {
  const [filterVisible, setFilterVisible] = useState(props.visible)

  function showFilters () {
    setFilterVisible(true)
  }

  function hideFilters () {
    setFilterVisible(false)
  }

  return (
    <View>
      <Pressable onPress={showFilters}>
        <Text>Filters...</Text>
        <Portal>
          <Dialog visible={filterVisible} onDismiss={hideFilters}>
            <Dialog.Title>Alert</Dialog.Title>
            <Dialog.Content>
              <SectionList  
                sections = {
                  [{title: 'Filters', data: ['Rating between:', 'Plays between:', 'Last played between:']},
                  {title: 'Tags', data: [props.tags]}]}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({item}) => (
                  <View>
                    <Text>{item}</Text>
                  </View>
                )}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideFilters}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Pressable>
    </View>
  )
}