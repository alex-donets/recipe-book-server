const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');
const { sendResetPassEmail } = require('../services/email-reset-pass.service');
const jwt_decode = require('jwt-decode');

router.post('/register', (req, res, next) => {

  let newUser = new User({
    fullName: req.body.fullName,
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    agreeTaC: req.body.agreeTaC,
    regDate: (new Date()).toISOString(),
  });

  User.getUserByEmail(newUser.email,(err, user) => {
    if (err) {
      res.json({ success: false, msg: 'User registration failed'});
    } else if (!user) {
      User.createUser(newUser, (err) => {
        if (err) {
          return res.status(403).json({ msg: 'Registration failed: ' + err.message });
        }

        return res.status(200).json({ msg: 'User registered' });
      });
    } else {
      res.status(403).json({ msg: 'User registration failed, email already in use'});
    }
  });
});

router.post('/update', passport.authenticate('user-rule', { session: false }), (req, res, next) => {
  let newUser = new User({
    _id: req.body._id,
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    password: req.body.password
  });

  User.getUserByEmail(newUser.email,(err, user) => {
    if (err) {
      res.json({ success: false, msg: 'User has NOT been updated.'});
    } else {
      User.updateUser(newUser).then((user) => {
        res.json({success: true, user: user});
      }).catch(next);
    }
  });
});

router.post('/login', (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  User.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.json({ success: false, msg: err });
    } else if (!user) {
      return res.status(404).json({ msg: `User with email ${email} is not registered` });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (isMatch) {
        const token = jwt.sign({ data: user }, process.env.AUTH_SECRET_KEY, {
          expiresIn: 604800 // 1 week
        });

        try {
          res.json({
            token,
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          });
        } catch (err) {
          res.status(401).json({ msg: 'Login failed. Please check email/password and try again'});
        }
      } else {
        return res.status(401).json({ msg: 'Login failed. Please check email/password and try again' });
      }
    });
  });
});

router.post('/reset-password', (req, res, next) => {
  const email = req.body.email;

  User.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.json({ success: false, msg: err });
    }
    if (!user) {
      return res.json({ success: false, msg: 'User not found' });
    }

    const token = jwt.sign({ data: user }, process.env.AUTH_SECRET_KEY, {
      expiresIn: 604800 // 1 week
    });

    sendResetPassEmail(email, token);
    res.status(200).json({ msg: "Reset password email has been sent" });
  });
});

router.post('/set-password', (req, res, next) => {
  const clientKey = req.body.key;
  const serverKey = process.env.AUTH_SECRET_KEY;
  const password = req.body.password;

  if (clientKey !== serverKey) {
    return res.status(403).json({ msg: 'Secret keys don\'t match' });
  }

  if (!req.body.token) {
    return res.status(403).json({ msg: 'User token is not provided' });
  }

  const token = jwt_decode(req.body.token);
  if (token) {
    const { data } = token;

    User.resetPassword(data.email, password, (err) => {
      if (err) {
        return res.status(403).json({ msg: 'Reset password failed: ' + err });
      }
      return res.status(200).json({ msg: 'Reset password success' });
    });
  }
});

router.get('/info', passport.authenticate('user-rule', { session: true }), (req, res, next) => {
  User.infoById(req.user._id).then((userInfo)=> {
   userInfo.cards = normalizeCards(userInfo.cards);
   res.json({success: true, user: userInfo});
 }).catch(next);
});

router.post('/find', passport.authenticate('admin-rule', { session: true }), (req, res, next) => {
  try {
    User.findUsersByOption(req.body.name, req.body.query, (err, users) => {
      if (err) {
        res.json({ msg: err });
      } else {
        res.json({ list: users });
      }
    });
  } catch (e) {
    console.log("Failed to get users: " + e);
    res.status(500).json({ success: false, msg: "Failed to get users: " + e });
  }
});

router.get('/:id', passport.authenticate('admin-rule', { session: true }), (req, res, next) => {
  try {
    User.customerInfoById(req.params.id).then((userInfo)=> {
      res.status(200).json({ success: true, user: userInfo });
    }).catch(next);
  } catch (e) {
    console.log("Failed to get users: " + e);
    res.status(500).json({ success: false, msg: "Failed to get users: " + e });
  }
});

module.exports = router;
