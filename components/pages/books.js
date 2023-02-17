import { ScrollView, Text, View, Button, StatusBar, Pressable, FlatList, Switch, Alert, Image } from 'react-native';
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

//Core main page containging navigators for all book components
const BooksStack = createNativeStackNavigator()

export default function Books () {
  return (
    <BooksStack.Navigator initialRouteName='List' screenOptions={{headerShown:false}}>
      <BooksStack.Screen 
        name="List"
        component={BooksList}
      />
      <BooksStack.Screen 
        name="Details"
        component={BooksDetails}
      />
      <BooksStack.Screen 
        name="QuickAdder"
        component={QuickAdder}
      />
    </BooksStack.Navigator>
  )
}

// List item for the flat list
const ListItem = ({name, sort, rating, author, series}) => {
  if (sort === 'none' || sort == null || sort == 'alphabetical' || sort == 'author' || sort == 'series') {
    return (
      <View style = {styles.listItem}>  
        <View style={styles.wideInfoListView}>
          <Text style={styles.listText} numberOfLines = {1} ellipsizeMode ='tail' >{name}</Text>
          <View style={styles.subheadingsListView}>
            <Text style={styles.listSubtext}>{author}</Text>
            {series != ''?
            <Text style={styles.listSubtext}> - {series}</Text> 
            : null}
          </View>
        </View>
      </View> 
         
    )
  } else if (sort == 'rating') {
    return  (
      <View style = {styles.listItem}>  
        <View style={styles.narrowInfoListView}>
          <Text style={styles.listText} numberOfLines = {1} ellipsizeMode ='tail' >{name}</Text>
          <View style={styles.subheadingsListView}>
            <Text style={styles.listSubtext}>{author}</Text>
            {series != ''?
            <Text style={styles.listSubtext}> - {series}</Text> 
            : null}
          </View>
        </View>
        <Text>Rated: {rating}</Text>
      </View> 
        
      
    )
  }
}


//Main menu flatlist of all added books
function BooksList ({navigation}) {
  //full list of books read from Async
  const [fullBooks, setFullBooks] = useState([])
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
    {label:'Author', value:'author'},
    {label:'Series', value:'series'}
  ])

  const isFocused = useIsFocused()

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('books')
      //console.log(value)
      if(value !== null) {
        setFullBooks(JSON.parse(value))
      }
    } catch(e) {
      console.warn("Book list not read")
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
      for(const book of fullBooks) {
        //console.log(book["name"])
        const nameCompare = book["name"].toUpperCase()
        const authorCompare = book["author"].toUpperCase()
        const seriesCompare = book["series"].toUpperCase()
        if (nameCompare.includes(searchTerm)) {
          //console.log(`match between ${searchTerm} and ${book.name}`)
          list.push(book)
        } else if (authorCompare.includes(searchTerm)) {
          list.push(book)
        } else if (seriesCompare.includes(searchTerm)) {
          list.push(book)
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
        list = fullBooks
      }
      sortList(list)
    }
    setSearchList(list)
  }

  function sortList (list) {
    let sortedList = list;
    //console.log(`Sorting: ${list}`)
    switch (ddValue) {
      case 'none':
        break;
      case 'alphabetical':
        sortedList.sort((a,b) => a.name.localeCompare(b.name))
        //console.log(`Alphabetised: ${JSON.stringify(sortedList)}`)
        break;
      case 'rating':
        sortedList.sort((a,b) => b.rating - a.rating)
        //console.log(`Rating: ${JSON.stringify(sortedList)}`)
        break;
      case 'author':
        sortedList.sort((a,b) => a.author.localeCompare(b.author))
        //console.log(`Author: ${JSON.stringify(sortedList)}`)
        break;
      case 'series':
        sortedList.sort((a,b) => b.series.localeCompare(a.series))
    }
    return sortedList;
  }
  
  const renderListItem = ({item}) => (
    <Pressable onPress= {() => {
        navigation.navigate('Details',{selected: item})
      }}
      onLongPress = {() => {}}>
      <ListItem name = {item.name}  sort = {ddValue} rating = {item.rating} author = {item.author} series = {item.series}/>
    </Pressable>
  )


  //<Button title= "clear async" onPress = {() => AsyncStorage.clear()} />
  return (
    <View style = {styles.list}>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <View style = {styles.listHeader}>
        <Pressable style = {styles.addButton} onPress={() => navigation.navigate('QuickAdder', {all: fullBooks})}> 
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
            data = {fullBooks} 
            extraData = {fullBooks}
            renderItem = {renderListItem} 
        />
        }   
      </View>
    </View>
  );
}

//details screen for when selecting a book from the list, details are passed via route.params
function BooksDetails ({route, navigation}) {
  //selected: book object passed via
  const {selected} = route.params;
  const [editable, setEditable] = useState(selected);
  const [commentTemp, setCommentTemp] = useState(editable.comments)
  const [author, setAuthor] = useState (editable.author)
  const [series, setSeries] = useState (editable.series)
  //bool used for date picker
  const [isStartDatePickerVisible,setStartDatePickerVisibility] = useState(false)
  const [isFinishDatePickerVisible,setFinishDatePickerVisibility] = useState(false)
  const [imageURI, setImageURI] = useState (editable.image)

  //the two use effects below are to update editable when states change used for inputs
  useEffect(() => {
    setEditable((prev) => ({...prev, comments: commentTemp}))
  }, [commentTemp])

  useEffect(() => {
    setEditable(prev => ({...prev, author: author}))
  },[author])

  useEffect(() => {
    setEditable(prev => ({...prev, series: series}))
  },[series])

  useEffect (() => {
    setEditable(prev => ({...prev, image: imageURI}))
  }, [imageURI])

  //following functions are for components eg. date picker, toggle switch etc.
  /*const toggleSwitch = () => {
    setOwned(previousState => !previousState);
  }*/

  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
  };

  const showFinishDatePicker = () => {
    setFinishDatePickerVisibility(true);
  };

  const hideFinishDatePicker = () => {
    setFinishDatePickerVisibility(false);
  };

  const handleLastConfirm = (date) => {
    //console.warn("A date has been picked: ", date);
    let DTsplit = JSON.stringify(date).replace('"', '').split('T')
    let newDate = DTsplit[0].split('-')
    setEditable((prev) => ({...prev, finishDate: `${newDate[2]}/${newDate[1]}/${newDate[0]}`}))
    hideDatePicker();
  };

  const handleStartConfirm = (date) => {
    //console.warn("A date has been picked: ", date);

    let DTsplit = JSON.stringify(date).replace('"', '').split('T')
    let newDate = DTsplit[0].split('-')
    setEditable((prev) => ({...prev, startDate: `${newDate[2]}/${newDate[1]}/${newDate[0]}`}))
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
      const fullBooks = await AsyncStorage.getItem('books')
      let savingFullBooks = JSON.parse(fullBooks)
      for (let i = 0; i < savingFullBooks.length; i ++) {
        if (savingFullBooks[i].name === editable.name) {
          console.log(`Match found: ${JSON.stringify(savingFullBooks[i])}`)
          console.log(`Making it: ${JSON.stringify(editable)}`)
          savingFullBooks[i] = editable;
        }
      }
      const stringed = JSON.stringify(savingFullBooks)
      AsyncStorage.setItem('books', stringed)
      navigation.goBack()
    } catch (e) {
      console.log(`Error saving changes: ${e}`)
    }
  }

  async function deleteBook (){
    const fullBooks = await AsyncStorage.getItem('books');
    let parsedBooks = JSON.parse(fullBooks);
    let newBooks = []
    for (let i = 0; i < parsedBooks.length; i ++) {
      if (parsedBooks[i].name !== editable.name) {
        newBooks.push(parsedBooks[i])
      } else {
        console.log(`Matching entry removed: ${parsedBooks[i].name}`)
      }
    }
    const stringed = JSON.stringify(newBooks)
    AsyncStorage.setItem('books', stringed)
    navigation.goBack()   
  }

  function deleteAlert () {
    Alert.alert(
      "Are you sure?",
      "Deleting a book can not be undone!",
      [
        {
          text: 'No, go back',
          onPress: () => console.warn("Deletion cancelled")
        },
        {
          text: "Yes, I'm sure",
          onPress: () => deleteBook()
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

        <View style = {styles.inlineView}>
          <Text style= {styles.subtitle}>Author: </Text>
          <TextInput style = {styles.entryBox} value = {author} onChangeText= {setAuthor} />
        </View>

        <View style = {styles.inlineView}>
          <Text style= {styles.subtitle}>Series: </Text>
          <TextInput style = {styles.entryBox} value = {series} onChangeText= {setSeries} />
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Date started: {editable.startDate}</Text>
          <View style= {styles.dateButtonContainerContainer}>
            <View style = {styles.dateButtonContainer}>
              <Button color ='#306935' title="Change date" onPress= {showStartDatePicker} ></Button>
            </View>
          </View>
          <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          onConfirm={handleStartConfirm}
          onCancel={hideStartDatePicker}
          />
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Date finished: {editable.finishDate}</Text>
          <View style= {styles.dateButtonContainerContainer}>
            <View style = {styles.dateButtonContainer}>
              <Button color ='#306935' title="Change date" onPress= {showFinishDatePicker} ></Button>
            </View>
          </View>
          <DateTimePickerModal
          isVisible={isFinishDatePickerVisible}
          mode="date"
          onConfirm={handleLastConfirm}
          onCancel={hideFinishDatePicker}
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

  const storeBook = async () => {
    console.log(`Adding ${name}`)
    try {
      const newbook = {
        name: name,
        author: '',
        rating: 1,
        startDate: '',
        finishDate:'',
        comments: '',
        series:'',
        image: ''
      }

      const combo = all.concat([newbook])
      console.log(combo)
      console.table(combo)
      const jsonValue = JSON.stringify(combo)
      await AsyncStorage.setItem('books',jsonValue)
      navigation.navigate('List')

    } catch (e) {
      console.warn(`Error: ${e}`)
    }
  }

  return (
    <View style = {styles.qaView}>
      <View >
        <Text style= {styles.qaTitle}> What is the name of your new book?</Text>
      </View>
      <View>
        <TextInput value = {name} onChangeText = {setName} style = {styles.qaInput}></TextInput>
        <View style = {styles.qaButtonView}>
          <Button style={styles.qaButton} onPress={storeBook} color ='#306935' title = 'Add book'/>
        </View>
      </View>
    </View>
  )
}
