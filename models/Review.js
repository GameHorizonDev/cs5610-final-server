const reviewSchema = new Schema({
    gameId: { type: Number, required: true },
    posterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    description: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
  }, { timestamps: true });
  
  const Review = mongoose.model('Review', reviewSchema);
  module.exports = Review;
  