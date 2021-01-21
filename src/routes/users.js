const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserModel = require('../models/user').User;
const { sendResetPassEmail } = require('../services/email-reset-pass.service');
const jwt_decode = require('jwt-decode');
const sanitize = require('mongo-sanitize');
const {
  signUpValidationSchema,
  signInValidationSchema,
  resetPassValidationSchema,
  setPassValidationSchema
} = require('../validations/user');

router.post('/register', async (req, res) => {
  try {
    let role = 'user';
    const userEmail = sanitize(req.body.email);

    if (userEmail === process.env.TEST_ADMIN_EMAIL || userEmail === process.env.RECIPE_ADMIN_EMAIL) {
      role = 'admin';
    }

    const email = userEmail && userEmail.toLowerCase();

    const newUser = new UserModel({
      fullName: sanitize(req.body.fullName),
      email: email || null,
      password: sanitize(req.body.password),
      agreeTaC: sanitize(req.body.agreeTaC),
      regDate: new Date().toISOString(),
      role: role
    });

    await signUpValidationSchema.validate(newUser);

    const existingUser = await User.getUserByEmail(newUser.email);

    if (existingUser) {
      return res.status(400).json({ msg: 'User registration failed, email already in use' });
    }

    const createdUser = await User.createUser(newUser);

    if (!createdUser) {
      return res.status(400).json({ msg: 'User registration failed' });
    }

    res.status(200).json({ msg: 'User registered' });
  } catch (e) {
    res.status(400).json({ msg: 'Registration failed: ' + e });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = {
      email: sanitize(req.body.email),
      password: sanitize(req.body.password)
    };

    await signInValidationSchema.validate(data);

    const user = await User.getUserByCredentials(data.email, data.password);
    const token = await User.generateAuthToken(user);

    await res.json({
      token,
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  } catch (e) {
    res.status(401).json({ msg: 'Login failed. Please check email/password and try again' });
  }
});

router.post('/reset-password', async(req, res) => {
  try {
    const userEmail = sanitize(req.body.email);
    const email = userEmail ? userEmail.toLowerCase() : undefined;

    await resetPassValidationSchema.validate({ email: userEmail });

    const user = await User.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const token = jwt.sign({ data: user }, process.env.AUTH_SECRET_KEY, {
      expiresIn: 604800 // 1 week
    });

    const response = await sendResetPassEmail(email, token);

    if (!response) {
      return res.status(400).json({ msg: 'Reset password email has not been sent' });
    }

    res.status(200).json({ msg: 'Reset password email has been sent' });
  } catch (e) {
    return res.status(403).json({ msg: e });
  }
});

router.post('/set-password', async (req, res) => {
  try {
    const clientKey = sanitize(req.body.key);
    const serverKey = process.env.AUTH_SECRET_KEY;
    const password = sanitize(req.body.password);

    await setPassValidationSchema.validate({ password });

    if (clientKey !== serverKey) {
      return res.status(403).json({ msg: "Secret keys don't match" });
    }

    if (!req.body.token) {
      return res.status(403).json({ msg: 'User token is not provided' });
    }

    const token = jwt_decode(req.body.token);

    if (token) {
      const { data } = token;

      const user = await User.resetPassword(data.email, password);

      if (!user) {
        return res.status(403).json({ msg: 'Reset password failed' });
      }

      res.status(200).json({ msg: 'Reset password success' });
    }
  } catch (e) {
    res.status(403).json({ msg: 'Reset password failed: ' + e });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const userEmail = sanitize(req.body.email);

    if (userEmail === process.env.TEST_ADMIN_EMAIL || userEmail === process.env.TEST_USER_EMAIL) {
      const user = await User.removeUser(userEmail);

      if (!user) {
        return res.status(403).json({ msg: 'Cannot delete user' });
      }

      return res.json({ msg: 'User has been deleted' });
    }

    res.status(401).json({ msg: 'Only test users can be deleted' });
  } catch (e) {
      return res.status(401).json({ msg: 'Cannot delete user: ' + e });
  }
});

module.exports = router;
