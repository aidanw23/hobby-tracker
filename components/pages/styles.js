import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

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
    height: '8%',
    width: '100%',
    backgroundColor: '#306935',
    marginBottom: 10,
  },
  addButton: {
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
    flexGrow: 4
  },
  sortContainer: {
    width: '30%',
    flexGrow: 1
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
  wideInfoListView: {
    flexDirection: 'column',
    width: '90%'
  },
  narrowInfoListView: {
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
    fontSize:14,
    color: 'whitesmoke',
  },
  searchOuter:  {
    color: '#81a688',
    paddingLeft: 10,
    marginLeft:10,
    marginRight: 10,
    backgroundColor: '#414542',
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