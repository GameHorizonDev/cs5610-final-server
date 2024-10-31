'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    gameId: { type: Number, required: true },
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  }, { timestamps: true });
  
  const Game = mongoose.model('Game', gameSchema);
  module.exports = Game;