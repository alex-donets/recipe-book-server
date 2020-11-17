const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const UserSchema = mongoose.Schema({
  fullName: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  agreeTaC: {
    type: Boolean,
    required: true
  },
  regDate: String,
}, {collection: config.dbPrefix + 'users'});

const User = module.exports = mongoose.model('User', UserSchema);

// User Info for customers

function userToUserInfo(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
  };
}

// User Info for admin

function customerInfo(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function toUserUpdate(data) {
  return {
    _id: data._id,
    name: data.name,
    email: data.email,
  };
}

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.getUserByEmail = function (email, callback) {
  const query = { email: email };
  User.findOne(query, callback);
};

module.exports.createUser = function (newUser, callback) {

  this.getUserByEmail(newUser.email, (err, user) => {
    if (user != null) {
      callback("Another user with same email already exists.", null);
      return;
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          callback(err.toString(), null);
        } else {
          newUser.password = hash;
          newUser.save(callback);
        }
      });
    });
  });
};

module.exports.updateUser = function (newUser) {
  const upsertData = toUserUpdate(newUser);
  const existingUser = User.infoById(newUser._id);
  return existingUser.then((user) =>{

    if (user.email !== upsertData.email) {
      upsertData.emailVerified = false;
    }
  }).then(() => {
    return User.update({_id: newUser._id}, upsertData, {upsert: true}).exec();
  }).then(() => {
    return User.findById(newUser._id).exec();
  })
      .then(User.toUserInfo);
};

module.exports.updateCustomer = function (updatedCustomer, callback) {
  const upsertData = updatedCustomer;
  User.updateOne({ _id: updatedCustomer._id }, upsertData, callback);
};

module.exports.updatePassword = function (newUser, callback) {
  User.update({ _id: newUser._id }, { password: newUser.password }, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err)
      callback(err.toString(), null);
    else
      callback(null, isMatch);
  });
};

module.exports.isAdmin = function (user) {
  return (user.role === "admin");
};

module.exports.resetPassword = function (email, password, callback) {
  const query = { email: email };
  User.findOne(query, (err, user) => {
    if (err) {
      callback(err, null);
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            callback(err.toString(), null);
          } else {
            let updatingUser = new User({
              _id: user._id,
              email: email,
              password: hash
            });
            this.updatePassword(updatingUser, callback);
          }
        });
      });
    }
  });
};

module.exports.toUserInfo = function (user) {
  return userToUserInfo(user);
};

module.exports.infoById = function (id) {
  return User.findById(id).exec().then(User.toUserInfo);
};

module.exports.customerInfoById = function (id) {
  return User.findById(id).exec().then(user => customerInfo(user));
};


module.exports.findUsersByOption = function (value, option, callback) {
  const regex = value.trim().replace('+', '') ;
  const query = { [option]: { $regex: new RegExp(regex, "i") } };

  User.find(query, `name email ${option}`, callback);
};

