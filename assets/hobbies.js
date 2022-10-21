
//THIS FILE IS DEFUNCT AND ONLY A TEMP STORE OF OLD CODE

/* OUTDATED CODE - QuickAdder now handles addition while details are handled after on its individual page
//page rendered when user tries to add new game
function BoardgamesAdder ({route, navigation}) {

  // all contains the full list of boardgames, so the new can be added to it and the new list overwrite its
  let {all} = route.params
  //stateful properties edited by user and saved as new game
  const [ntitle, onChangeTitle] = React.useState("Title")
  const [nplays, onChangePlays] = React.useState("0")
  const [nrating, onChangeRating] =React.useState(0)
  const [nlastPlayed, setLastPlayed] = React.useState("Not set")
  const [ncomments, setComments] = React.useState("")
  //bool used for date picker
  const [isDatePickerVisible,setDatePickerVisibility] = useState(false)

  // old use effect for tracking the passed  list
  useEffect(() => {
    console.log('-----ADDER-----')
    console.log(`Full is now: ${JSON.stringify(all)}`)
    console.log(typeof all)
  }, [all])
  

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    //console.warn("A date has been picked: ", date);
    setLastPlayed(date)
    hideDatePicker();
  };
  //function called to save properties using async storage and then navigate user out of adder
  const storeGame = async () => {
    try {
      const newgame = {
        name: ntitle,
        plays: nplays,
        rating: nrating,
        comments: ncomments,
        lastPlayed: nlastPlayed,
        owned: true
      }

      const combo = all.concat([newgame])
      const jsonValue = JSON.stringify(combo)
      await AsyncStorage.setItem('boardgames',jsonValue)
      navigation.navigate('List')

    } catch (e) {
      console.warn(`Error: ${e}`)
    }

  }

  return (
    <View>
      <Text>Add a new game</Text>
      <View>
        <Text>Title:</Text>
        <TextInput value={ntitle} onChangeText={onChangeTitle}/>
      </View>

      <Text>No. of plays:</Text>
      <TextInput value={nplays} onChangeText={onChangePlays}/>

      <Text>Rating:</Text>
      <Text>{nrating}</Text>
      <Slider 
        minimumValue={1}
        maximumValue={10}
        step={0.5}
        onValueChange={onChangeRating}
      />

      <Text>Last Played:</Text>
      <Pressable onPress={showDatePicker}>
        <Text>Please select date</Text>
      </Pressable>
      <Text>{JSON.stringify(nlastPlayed)}</Text>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <Text>Comments:</Text>
      <TextInput value={ncomments} onChangeText={setComments}/>

      <Button title = "Add game" onPress={storeGame}></Button>
    </View>
  )
}
*/

/*
{
  "boardgames": [
    {
      "name":"Inis",
      "id":"1",
      "plays": 2,
      "rating": 7,
      "comments": "",
      "lastPlayed":"12/02/22"
    },
    {
      "name": "Spirit Island",
      "id":"2",
      "plays": 6,
      "rating": 7,
      "comments": "",
      "lastPlayed":"25/09/22"
    },
    {
      "name": "Gloomhaven",
      "id":"3",
      "plays": 0,
      "rating": 7,
      "comments": "",
      "lastPlayed":"12/02/22"
    },
    {
      "name": "Oath: Chronicles of Empire & Exile",
      "id":"4",
      "plays": 2,
      "rating": 7,
      "comments": "",
      "lastPlayed":"12/02/22"
    },
    {
      "name": "King's Dillema",
      "id":"5",
      "plays": 2,
      "rating": 7,
      "comments": "",
      "lastPlayed":"12/02/22"
    }
  ]
}
*/