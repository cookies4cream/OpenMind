const User = require("./models").User;
const bcrypt = require("bcryptjs");
const Post = require("./models").Post;
const Comment = require("./models").Comment;
const Favorite = require("./models").Favorite;

module.exports = {
// #2
  createUser(newUser, callback){

// #3
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

// #4
    return User.create({
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      err.param = "email";
      err.msg = "already exists";
      callback(err);
    })
  },

  getUser(id, callback){
    let result = {};
    User.findById(id)
    .then((user) => {
      if(!user) {
        callback(404);
      } else {
        result["user"] = user;
        Post.scope({method: ["lastFiveFor", id]}).all()
        .then((posts) => {
          result["posts"] = posts;
          Comment.scope({method: ["lastFiveFor", id]}).all()
          .then((comments) => {
            result["comments"] = comments;
            Favorite.scope({method: ["allFovoritesFor", id]}).all()
            .then((favorites)=>{
              result["favorites"] = favorites;
              callback(null, result);
            })
            .catch((err)=>{
              callback(err);
            })
          })
          .catch((err) => {
            callback(err);
          })
        })
      }
    })
  }

}
