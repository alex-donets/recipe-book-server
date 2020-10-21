const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');
const PassReset = require('../models/passreset');

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
      User.createUser(newUser, (err, user) => {
        if (err) {
          return res.status(403).json({ success: false, msg: 'Registration failed: ' + err });
        }

        return res.json({ success: true, msg: 'User registered', user: user });
      });
    } else {
      res.status(403).json({ success: false, msg: 'User registration failed, email already in use'});
    }
  });
});

// Update profile for common users

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

// Update user profile for admin

router.post('/update-user', passport.authenticate('admin-rule', { session: false }), (req, res, next) => {
  if (req.user._id.equals(req.body._id)) {
    return res.json({ success: false, msg: 'Admin cannot update own profile from this page.' });
  }
  if (req.body.role === 'Admin') {
    return res.json({ success: false, msg: 'Customer\'s role can\'t be changed to "Admin".' });
  }

  const updatedCustomer = {
    _id: req.body._id,
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    phone: req.body.phone,
    address: req.body.address,
    role: req.body.role,
    notes: req.body.notes
  };

  User.updateCustomer(updatedCustomer, (err, customer) => {
    if (err) {
      res.json({ success: false, msg: 'Customer profile has NOT been updated.' + err.msg });
    } else {
      res.json({ success: true, msg: 'Customer profile has been updated.' });
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
      return res.status(422).json({ msg: 'User not found' });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        return res.json({ success: false, msg: err });
      }
      if (isMatch) {
        const token = jwt.sign({ data: user }, config.authSecret, {
          expiresIn: 604800 // 1 week
        });

        try {
          const userInfo = User.toUserInfo(user);
          res.json({
            token,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          });
        } catch (err) {
          res.status(401).json({ success: false, msg: 'Authentication failed.'});
        }
      } else {
        return res.status(401).json({ success: false, msg: 'Authentication failed.' });
      }
    });
  });
});

router.post('/forgot', (req, res, next) => {
  const email = req.body.email.toLowerCase();

  User.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.json({ success: false, msg: err });
    }
    if (!user) {
      return res.json({ success: false, msg: 'User not found' });
    }

    let newPassReset = new PassReset({
      datetime: (new Date()).toISOString(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      email: email
    });
    PassReset.addPassReset(newPassReset, (err, passreset) => {
      if (err) {
        return res.json({ success: false, msg: err });
      }

      sendEmail(email, 'EatClick password reset', '',
        `Hi,<br>
        We received a password reset request for your account.<br>
        If it was you, please click on the following link to go to change password page, 
        otherwise just ignore it.<br>
        <br>
        <a href='${config.eatClickURL}/user/passreset/${passreset.upserted[0]._id}'><strong>Reset Password</strong></a>`,
        (result) => {
          return res.json(result);
        }
      );
    });

  });
});

router.post('/pass-reset', (req, res, next) => {
  const key = req.body.key;
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  PassReset.getPassResetById(key, (err, passreset) => {
    if (err) {
      return res.json({ success: false, msg: 'Invalid key: ' + err });
    }
    if (passreset.email != email) {
      return res.json({ success: false, msg: 'Invalid email address' });
    }
    User.resetPassword(email, password, (err) => {
      if (err) {
        return res.json({ success: false, msg: 'Reset failed: ' + err });
      }
      PassReset.removePassReset(passreset._id, (err) => {
        if (err) {
          return res.json({ success: false, msg: 'Reset failed: ' + err });
        }
        res.json({ success: true, msg: 'Reset success.' });
      });
    });
  });
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
        res.json({ success: false, msg: err });
      } else {
        res.json({ success: true, list: users });
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
      res.status(200).json({success: true, user: userInfo});
    }).catch(next);
  } catch (e) {
    console.log("Failed to get users: " + e);
    res.status(500).json({ success: false, msg: "Failed to get users: " + e });
  }
});

module.exports = router;
