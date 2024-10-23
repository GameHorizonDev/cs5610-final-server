'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
    commenterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
  }, { timestamps: true });
  
  const Comment = mongoose.model('Comment', commentSchema);
  module.exports = Comment;