const express = require ('express')
const router = express.Router()
const Boardgame = require('../models/Boardgame')
const bodyParser = require ('body-parser')

router.use (bodyParser.json())

//get full list
router.get('/' , async (req, res) => {
  try {
    const data = await Boardgame.find()
    res.send(data)
  } catch(err) {
      console.log(err)
  }
})

//add new boardgame
router.post('/add-new', (req,res) => {
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

//fetch specific game
router.get('/:bgId', async (req, res) => {
  try {
    const game = await Boardgame.findById(req.params.bgId)
    res.json(game)
  } catch (err) {
    res.json(err)
  }
})

//delete a game 
router.delete ('/delete/:bgId', async (req,res) => {
  try{
    const deleted = Boardgame.remove({_id: req.params.bgId})
    console.log("game deleted")
  } catch (err) {
    res.json({message: err})
  }
})

router.patch ('/update/:bgId', async (req,res) => {
  try{
    const updated = Boardgame.updateOne({_id: req.params.bgId}, 
      {$set: {
        title: req.body.title
      }})
  } catch (err) {
    res.json({message: err})
  }
})
module.exports = router;