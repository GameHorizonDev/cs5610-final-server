const User = require('./models/User');
const Review = require('./models/Review');
const Comment = require('./models/Comment');

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
      const promise = new Promise((resolve, reject) => {
        User.register(tempUser, roles[i], (err, user) => {
          if (err) {
            reject(err);
          } else {
            resolve(user);
          }
        });
      });
      promises.push(promise);
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

    const review2 = await Review.create({
      gameId: 523,
      reviewerId: user._id,
      rating: user.role === "critic" ? 5 : 7,
      text: "fall guys review",
    });
    reviewIds.push(review2._id);
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
      await review.save();
    }
  }

  console.log('Created comments');
};

seedUsers()
.then(() => { return seedReviews() })
.then(() => { return seedComments() })
.then(() => {
  console.log("closing")
  db.close()
})