import { ScrollView, Text, View, Pressable, Switch, Alert, Image } from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';
import {styles} from '../styles.js'

import { supabase } from '../../../supaback/supabase.js'
import { UserContext } from '../../utils.js';


//details screen for when selecting a boardgame from the list, details are passed via route.params
export function BoardgamesDetails ({route, navigation}) {
  //selected: game object passed via nav route
  const {selected} = route.params;
  //editable is a copy of the selected game which will be changed up as user edits details
  const [editable, setEditable] = useState(selected);
  const [commentTemp, setCommentTemp] = useState(editable.comments)
  const [owned, setOwned] = useState (editable.owned)
  //bool used for date picker
  const [isDatePickerVisible,setDatePickerVisibility] = useState(false)
  const [imageURI, setImageURI] = useState (editable.image)

  const user = useContext(UserContext)

  //the three use effects below are to update editable when states change used for inputs
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

  /*
  function called when save button is hit
    finds match in Async storage and replaces it with "editable" state (updated details)
    
    updates last update time to be same on local and online
  */
  async function saveChanges () {
    
    console.log(`saving ${editable}`)
    const updateTime = Date.now()
    //try catch for local saves
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
      AsyncStorage.setItem('boardgameTime', updateTime)
      navigation.goBack()
    } catch (e) {
      console.log(`Error saving changes locally: ${e}`)
    }

    //cloud save
    try {
      const { error } = await supabase
        .from('boardgames')
        .update({name: editable.name, comments: editable.comments, owned: editable.owned, plays: editable.plays, rating: editable.rating, lastPlayed: editable.lastPlayed })
        .eq('user_id', user.id)
    } catch (e) {

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
    const updateTime = Date.now()
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
              <Image style = {styles.bin} source = {require('../../../assets/binning.png')} /> 
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
            <Button buttonColor ='#306935' title = 'Add an image' onPress={addImage} style = {styles.imageButton}></Button>
          </View>
          }
        </View>
      <View>
        <View style={styles.counterView}>
          <Text style= {styles.subtitle}>Play count:</Text>
          <Button buttonColor ='#306935' title = "-" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays - 1}))}></Button>
          <Text style= {styles.subtitle}>{editable.plays}</Text>
          <Button buttonColor ='#306935' title = "+" onPress={() => setEditable((prev) => ({...prev, plays: +prev.plays + 1}))}></Button>
        </View>

        <View style={styles.basicView}>
          <Text style= {styles.subtitle}>Last played: {editable.lastPlayed}</Text>
          <View style= {styles.dateButtonContainerContainer}>
            <View style = {styles.dateButtonContainer}>
              <Button buttonColor ='#306935' title="Change date" onPress= {showDatePicker} ></Button>
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
        <Button buttonColor ='#306935' title = 'Save' onPress={saveChanges}></Button>
      </View>
    </View>
  </ScrollView>
  )
}