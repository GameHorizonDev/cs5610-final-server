'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['critic', 'audience', 'admin'], default: 'audience' },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  favoriteGames: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  bookmarkedReviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
}, { timestamps: true });

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model('User', UserSchema);
module.exports = User;