const { User, Audience, Critic, Admin } = require('./models/User');
const Review = require('./models/Review');
const Comment = require('./models/Comment');
const Game = require("./models/Game");

const mongoose = require("mongoose");
const mongodb_URI = 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: 'cs5610_db',
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));
const db = mongoose.connection;

const userObjs = []

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    const promises = [];
    const roles = ["critic", "audience", "admin"]
    for (let i = 0; i <= 2; i++){
      const tempUser = {
        username: roles[i], 
        email: `${roles[i]}@email.com`,
        role: roles[i],
      };
      userObjs.push(tempUser);
      if (roles[i] == 'critic') {
        const promise = new Promise((resolve, reject) => {
          Critic.register(tempUser, roles[i], (err, user) => {
            if (err) {
              reject(err);
            } else {
              resolve(user);
            }
          });
        });
        promises.push(promise);
      } else if (roles[i] == 'audience') {
        const promise = new Promise((resolve, reject) => {
          Audience.register(tempUser, roles[i], (err, user) => {
            if (err) {
              reject(err);
            } else {
              resolve(user);
            }
          });
        });
        promises.push(promise);
      } else if (roles[i] == 'admin') {
        const promise = new Promise((resolve, reject) => {
          Admin.register(tempUser, roles[i], (err, user) => {
            if (err) {
              reject(err);
            } else {
              resolve(user);
            }
          });
        });
        promises.push(promise);
      }
      
    }
    await Promise.all(promises);
    console.log("Users added");
  } catch (error) {
    console.error(error);
  }
};

const reviewIds = [];

const seedReviews = async () => {
  await Review.deleteMany({});
  for (let i = 0; i < 3; i++) {
    if (userObjs[i].role === "admin") continue;
    const user = await User.findOne({ email: userObjs[i].email });

    const review1 = await Review.create({
      gameId: 540,
      reviewerId: user._id,
      rating: user.role === "critic" ? 6 : 8,
      text: "overwatch 2 review",
    });
    reviewIds.push(review1._id);
    user.reviews.push(review1._id);

    const review2 = await Review.create({
      gameId: 523,
      reviewerId: user._id,
      rating: user.role === "critic" ? 5 : 7,
      text: "fall guys review",
    });
    reviewIds.push(review2._id);
    user.reviews.push(review2._id);
    await user.save();
  }

  console.log('Created reviews');
};

const seedComments = async () => {
  await Comment.deleteMany({});
  for (let i = 0; i < 3; i++) {
    if (userObjs[i].role === "admin") continue;
    const user = await User.findOne({ email: userObjs[i].email });
    
    for (let revId = 0; revId < reviewIds.length; revId += 2) {
      const comment = await Comment.create({
        reviewId: reviewIds[revId],
        commenterId: user._id,
        text: `${user.role} coment`,
      });

      const review = await Review.findOne({_id : reviewIds[revId]});
      review.comments.push(comment);
      user.comments.push(comment._id);
      await user.save();
      await review.save();
    }
  }

  console.log('Created comments');
};

const seedFavoritesBookmarks = async () => {
  await Game.deleteMany({});
  for (let i = 0; i < 3; i++) {
    if (userObjs[i].role === "admin") continue;
    const user = await User.findOne({ email: userObjs[i].email });
    
    for (let revId = 0; revId < reviewIds.length; revId += 2) {
      const review = await Review.findOne({_id : reviewIds[revId]});
      const gameId = review.gameId;
      
      if (!user.favoriteGames.includes(gameId)) {
        let game = await Game.findOne({ gameId : gameId})
        if (!game) {
          game = await Game.create({
            gameId: gameId,
          });
        }
        if (!user.favoriteGames.includes(game._id)) {
          game.favoritedBy.push(user._id);
          await game.save();
          user.favoriteGames.push(game._id);
        }
      }

      if (!user.bookmarkedReviews.includes(review._id)) {
        review.bookmarkedBy.push(user._id);
        user.bookmarkedReviews.push(review._id);
        await review.save();
      }
    }
    await user.save();
  }

  console.log('Created favorites and bookmarks');
};

seedUsers()
.then(() => { return seedReviews() })
.then(() => { return seedComments() })
.then(() => { return seedFavoritesBookmarks() })
.then(() => {
  console.log("closing")
  db.close()
})