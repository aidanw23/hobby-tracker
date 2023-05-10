const mongoose = require('mongoose')

const BoardgameSchema = new mongoose.Schema ({
  name: String,
  comments: String,
  owned: Boolean,
  plays: Number,
  rating: Number,
  lastPlayed: String
})

module.exports = mongoose.model("Boardgame", BoardgameSchema)