const express = require('express')
const app = express()
const bodyParser = require ('body-parser')
const mongoose = require ('mongoose')
require('./Boardgame')
require('dotenv').config({path:'../.env'})

app.use(bodyParser.json())

const Boardgame = mongoose.model("boardgame")
const mongouri = process.env.MONGO_URI


mongoose.connect (mongouri, {
  useNewUrlParser:true
})

mongoose.connection.on("connected", () => {
  console.log("connected to mongo")
})

mongoose.connection.on("error", (err) => {
  console.log("error: " + err)
})

app.get('/' , (req, res) => {
  Boardgame.find({}).then(data=> {
    res.send(data)}
    ).catch(err => {
      console.log(err)
    })
})

app.post('/send-data', (req,res) => {
  const boardgame = new Boardgame({
    name:req.body.name,
    rating: req.body.rating,
    comments: req.body.comments,
    owned: req.body.owned,
    lastPlayed: req.body.lastPlayed,
    plays: req.body.plays
  })
  boardgame.save()
  .then(data => {
    console.log(data)
    res.send("success")
  }).catch(err => {
    console.log(err)
  })
  
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

app.listen(3000, ()=>{
  console.log('server running')
})