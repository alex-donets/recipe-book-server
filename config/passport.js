const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('../config/config');

module.exports = function(passport) {
  
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = config.authSecret;

  passport.use('admin-rule', new JwtStrategy(opts, (jwt_payload, done) => {
    User.getUserById(jwt_payload.data._id, (err, user) => {
      if(err) {
        return done(err, false);
      }

      if(user && User.isAdmin(user)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));

  passport.use('user-rule', new JwtStrategy(opts, (jwt_payload, done) => {
    User.getUserById(jwt_payload.data._id, (err, user) => {
      if(err) {
        return done(err, false);
      }

      if(user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));

  passport.serializeUser(function(user, done) {
    const sessionUser = {
      _id: user._id,
      email: user.email,
      phone: user.phone
    };

    done(null, sessionUser);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};


