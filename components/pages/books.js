import { StyleSheet, Text, View, Button, StatusBar, Pressable, FlatList } from 'react-native';
import React, {useState} from 'react';

const ListItem = ({name}) => {
    return (
      <Pressable>
        <View style={styles.listItem}>
          <Text style={styles.listText}>{name}</Text>
        </View>
      </Pressable>
    )
}

const DATA = [
    {name:'Way of Kings',
    id:'1',
    },
    {name: 'Hero of Two Worlds: The Marquis de Lafayette in the Age of Revolution',
    id:'2',
    },
    {name: 'Fellowship of the Ring',
    id:'3',
    },
    {name: 'The Two Towers',
    id:'4',
    },
    {name: 'The Return of the King',
    id:'5'},
];

export default function Books () {
    const [boardgames, setBoardgames] = useState([])

    const renderListItem = ({item}) => (
        <ListItem name = {item.name} />
    )

    return (
      <View>
        <StatusBar translucent = {false} backgroundColor = '#306935'/>
        <FlatList 
            data = {DATA} 
            renderItem = {renderListItem} 
            keyExtractor = {item => (item.id)}
        />
      </View>
    );
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