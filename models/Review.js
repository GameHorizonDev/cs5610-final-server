'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    gameId: { type: Number, required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    text: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }, { timestamps: true });
  
  const Review = mongoose.model('Review', reviewSchema);
  module.exports = Review;
  