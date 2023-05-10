const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require ('body-parser')
const mongoose = require ('mongoose')
const Boardgame = require('./models/Boardgame')

require('dotenv').config({path:'../.env'})

app.use(cors())
app.use(bodyParser.json())


const mongouri = process.env.MONGO_URI

//MONGOOSE CONNECTION
mongoose.connect (mongouri, {
  useNewUrlParser:true
})

mongoose.connection.on("connected", () => {
  console.log("connected to mongo")
})

mongoose.connection.on("error", (err) => {
  console.log("error: " + err)
})

//ROUTES IMPORT
const boardgamesRoute = require('./routes/boardgameRoutes.js')
app.use ('/boardgames', boardgamesRoute)




//ROUTES
app.get('/' , (req, res) => {
  res.send("Its working")
  console.log("gotten")
})



app.post('/delete', (req,res) => {
  Boardgame.findByIdAndRemove(req.body.id)
  .then(data => {
    console.log('deleted: ' +data)
    res.send('deleted')
  })
  .catch(err => {
    console.log(err)
  })
})

app.post('/update', (req,res) => {
  Boardgame.findByIdAndUpdate(req.body.id, {
    name:req.body.name,
    rating: req.body.rating,
    comments: req.body.comments,
    owned: req.body.owned,
    lastPlayed: req.body.lastPlayed,
    plays: req.body.plays
  }).then(data=>{
    console.log("updated: " + data)
    res.send("updated")
  }).catch(err => {
    console.log(err)
  })
})

app.listen(process.env.PORT, ()=>{
  console.log('server running')
})