import { Text, View, Pressable, SectionList, Alert } from 'react-native';
import React, {useEffect, useState, createContext} from 'react';
import { TextInput, Dialog, Button, Portal } from 'react-native-paper';
import DropDownPicker from "react-native-dropdown-picker";
import { styles } from './pages/styles';

/*  SORT DROPDOWN
Props are: value (selected sort passed up with onChange), onChange (=handleSortChange in parent),
 items (array of objs of label and value pairs)
*/
export function SortDropdown (props) {
  const [ddOpen, setDDOpen] = useState(false)
  const [ddItems, setDDItems] = useState (props.items)

  return (
    <View style = {styles.sortContainer}>
      <DropDownPicker 
        open = {ddOpen}
        value = {props.value}
        items = {ddItems}
        setOpen = {setDDOpen}
        setValue = {props.onChange}
        setItems = {setDDItems}
        placeholder="Sort list..."
      />
    </View>
  )
}

/*  SEARCH BAR
props for search bar are: sortType (=sortValue ), fullList (=full list of items),
 onChange (=handleSearchChange, passes searchlist upward) 
*/
export function SearchBar (props) {
  const [search, setSearch] = useState('')

  //if fullBG is changed it'll update the search list, this lets it update right away when deets are edited
  useEffect (() => {
    makeSearchList()
  },[props.fullList, props.sortType])

  /* makeSearchList is a function called when a search term is entered or a sortvalue is set
  if a search term is set it will find matching itemnames and add item to list, if no match is found it creates an alert
  then passes back to parent handler where sort is applied */
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
export function FilterSelection (props) {
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

//Context provider that will pass user id down in App.js so subcomponents can use it to find bits
export const UserContext = createContext(0)