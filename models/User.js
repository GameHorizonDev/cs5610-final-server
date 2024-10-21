const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['critic', 'audience', 'admin'], default: 'audience' },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
