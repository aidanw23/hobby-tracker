import { Text, Animated, View, StatusBar, Pressable, FlatList } from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles} from './styles.js'
import { SortDropdown, SearchBar, FilterSelection } from '../utils.js';


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
export function DevTest ({navigation}) {

  //full list of boardgames and tags read from Async
  const [fullBG, setFullBG] = useState([])
  const [bgTags, setBGTags] = useState([])

  //search term entered to search list
  
  const [selection, setSelection] = useState()

  //array of results using search
  const [searchList, setSearchList] = useState([])

  const [sortValue, setSortValue] = useState(null)
  const [sortItems, setSortItems] = useState ([
    {label: '-', value: 'none'},
    {label:'Last Played', value: 'last played'},
    {label:'Alphabetical', value: 'alphabetical'},
    {label:'Rating', value: 'rating'},
    {label: 'Most Played', value: 'most played'}
  ])

  const isFocused = useIsFocused()

  //getdata - async function that reads local storage and cloud for stored boardgames and tags
  //if it 
  const getData = async () => {
    try {
      const localValue = await AsyncStorage.getItem('boardgames')
      const response = await fetch('http://192.168.1.89:5050/boardgames/', {
      method: 'GET'
      })
      const cloudValue = await response.json()
      console.log(`cloud: ${JSON.stringify(cloudValue)}`)
      console.log(`local: ${JSON.stringify(localValue)}`)
      if(cloudValue !== null) {
        setFullBG("From cloud: " + cloudValue)
        console.log(JSON.stringify(fullBG))
      } else if (localValue !== null) {
        setFullBG(JSON.parse(localValue))
        console.log("From local: " + JSON.stringify(fullBG))
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
      //setSearchList([])
    },[isFocused])
  )
  

  function handleFilterSelection (selection) {
    setSelection(selection)
  }

  function handleSearchChange (list) {
    if(sortValue !== 'none'|| sortValue !== null) {
      if (list.length == 0) {
        list = fullBG
      }
      list = sortList(list)
    }
    setSearchList(list)
  }

  function handleSortChange (newValue) {
    setSortValue(newValue)
  }

  //function containing switch case matching sorted value to a sort for the list
  //called as part of the handler for Search change
  function sortList (list) {
    let sortedList = list;
    switch (sortValue) {
      case 'none':
        break
      case 'alphabetical':
        sortedList.sort((a,b) => a.name.localeCompare(b.name))
        break;
      case 'rating':
        sortedList.sort((a,b) => b.rating - a.rating)
        break;
      case 'most played':
        sortedList.sort((a,b) => b.plays - a.plays)
        break;
      case 'last played':
        sortedList.sort(function (a,b) {
          var aSplit = a.lastPlayed.split('/')
          var bSplit = b.lastPlayed.split('/')
          return new Date(bSplit[2],bSplit[1]-1,bSplit[0]) -  new Date(aSplit[2],aSplit[1]-1,aSplit[0])
        })
    }
    return sortedList;
  }
  
  //render function for list items in the main list
  const renderListItem = ({item}) => (
    <Pressable onPress= {() => {
        navigation.navigate('Details',{selected: item})
      }}
      onLongPress = {() => {}}>
      <ListItem name = {item.name}  sort = {sortValue} rating = {item.rating} plays = {item.plays} lastPlayed = {item.lastPlayed}/>
    </Pressable>
  )
  

  async function boardgameGetter () {
    console.log('Pressed')
    try {
      const response = await fetch('http://192.168.1.89:5050/boardgames/', {
      method: 'GET'
      })
      const data = await response.json()
      console.log(JSON.stringify(data))
    } catch (err) {
      console.log(err)
    }
  }
//<Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
  return (
    <View style = {styles.list}>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>

      <View style = {styles.listHeader}>
        <Pressable style = {styles.addButton} onPress={() => navigation.navigate('QuickAdder', {all: fullBG})}> 
            <Text style = {styles.headerText}>+</Text>
        </Pressable>
        <Pressable onPress = {boardgameGetter}>
          <Text style = {styles.headerText}>GET</Text>
        </Pressable>
      </View>

      {/* SEARCH AND SORT*/}
      <View style = {styles.searchAndSortContainer}>
        <SortDropdown onChange = {handleSortChange} value = {sortValue} items = {sortItems} />
        <SearchBar onChange = {handleSearchChange} fullList = {fullBG} sortType = {sortValue}/>
        <View>
          <FilterSelection onChange = {handleFilterSelection} tags = {bgTags}/>
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
