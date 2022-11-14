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
  if (sort === 'none' || sort == null || sort == 'alphabetical') {
    return (
      <View style = {styles.listItem}>  
        <View style={styles.wideBookInfoListView}>
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
        <View style={styles.narrowBookInfoListView}>
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
    {label:'Rating', value: 'rating'}
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
        if (nameCompare.includes(searchTerm)) {
          //console.log(`match between ${searchTerm} and ${book.name}`)
          list.push(book)
        } else if (authorCompare.includes(searchTerm)) {
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
    <View style = {styles.listBooks}>
      <StatusBar translucent = {false} backgroundColor = '#306935'/>
      <View style = {styles.listHeader}>
        <Pressable style = {styles.addBooksButton} onPress={() => navigation.navigate('QuickAdder', {all: fullBooks})}> 
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
  const [isDatePickerVisible,setDatePickerVisibility] = useState(false)
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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
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
              <Button color ='#306935' title="Change date" onPress= {showDatePicker} ></Button>
            </View>
          </View>
          <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleStartConfirm}
          onCancel={hideDatePicker}
          />
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Date finished: {editable.finishDate}</Text>
          <View style= {styles.dateButtonContainerContainer}>
            <View style = {styles.dateButtonContainer}>
              <Button color ='#306935' title="Change date" onPress= {showDatePicker} ></Button>
            </View>
          </View>
          <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleLastConfirm}
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
    justifyContent:'center',
  },
  imageButton: {
    paddingTop: 10
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
  entryBox: {
    width: '60%',
    fontsize:14,
    borderWidth: 1,
    borderColor: '#306935',
    margin: 5,
    padding: 5,
    backgroundColor: 'whitesmoke',
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
  inlineView:{
    flexDirection: 'row',
    width:'100%'
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
  addBooksButton: {
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
  listBooks: {
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
    width: '100%',

    backgroundColor:'#fff',
    borderTopColor: '#cfcfcf',
    borderTopWidth: 1,
  },
  wideBookInfoListView: {
    flexDirection: 'column',
    width: '90%'
  },
  narrowBookInfoListView: {
    flexDirection: 'column',
    width: '75%'
  },
  subheadingsListView: {
    flexDirection: 'row',
    backgroundColor:'#fff',
    justifyContent: 'flex-start',
    alignItems:'center',
    width: '100%'
  },
  listText: {
    fontSize: 16,
    width: '100%'
  },
  listSubtext: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#636363'
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