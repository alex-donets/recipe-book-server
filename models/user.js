const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema(
  {
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
    regDate: String
  },
  { collection: process.env.DB_PREFIX + 'users' }
);

const User = mongoose.model('User', UserSchema);

const getUserByEmail = (email) => {
  return User.findOne({ email });
};

const getUserById = ( _id ) => {
  return User.findOne({ _id });
};

const getUserByCredentials = async (email, password) => {
  const emailLowerCased = email ? email.toLowerCase() : undefined;
  const user = await User.findOne({ email: emailLowerCased });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Passwords not match');
  }

  return user;
};

const generateAuthToken = async (user) => {
  const token = jwt.sign(
    { data: user },
    process.env.AUTH_SECRET_KEY,
    { expiresIn: 604800 } // 1 week
  );

  return token;
};

const createUser = async (newUser) => {
  try {
    const hash = await hashPassword(newUser.password);

    newUser.password = hash;

    return newUser.save();
  } catch (e) {
    throw new Error('Cannot create user');
  }
};

const hashPassword = async(password) => {
  const salt = await bcrypt.genSalt(10);

  if (!salt) {
    throw new Error('Cannot encrypt a password');
  }

  const hash = await bcrypt.hash(password, salt);

  if (!hash) {
    throw new Error('Cannot generate hash');
  }

  return hash;
};

const updatePassword = ({ _id, password }) => User.update({ _id }, { password });

const comparePassword = (password, hash) => {
  try {
    return bcrypt.compare(password, hash);
  } catch (e) {
    throw new Error(e);
  }
};

const isAdmin = (user) => {
  return user.role === 'admin';
};

const resetPassword = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const hash = await hashPassword(password);

    const updatingUser = new User({
      _id: user._id,
      email,
      password: hash
    });

    const updatedUser = await updatePassword(updatingUser);

    if (!updatedUser) {
      throw new Error('Cannot update user');
    }

    return updatedUser;
  } catch (e) {
    throw new Error(e);
  }
};

const removeUser = (email) => User.remove({ email });

module.exports = {
  User,
  getUserByEmail,
  getUserById,
  getUserByCredentials,
  generateAuthToken,
  createUser,
  updatePassword,
  comparePassword,
  resetPassword,
  isAdmin,
  removeUser
};
