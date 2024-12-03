'use strict';
const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

// Base User Schema
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

const CriticSchema = new Schema({
  isFeaturedCritic: { type: Boolean, default: false }
});
const Critic = User.discriminator('Critic', CriticSchema);

const AudienceSchema = new Schema({
  membershipLevel: { type: String, enum: ['basic', 'premium'], default: 'basic' }
});
const Audience = User.discriminator('Audience', AudienceSchema);

const AdminSchema = new Schema({
  adminPermissions: { type: String, default: 'all' }
});

const Admin = User.discriminator('Admin', AdminSchema);

module.exports = {
  User,
  Critic,
  Audience,
  Admin
};
