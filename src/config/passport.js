const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

module.exports = (passport) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromHeader('jwt');
  opts.secretOrKey = process.env.AUTH_SECRET_KEY;

  passport.use(
    'admin',
    new JwtStrategy(opts, async(jwt_payload, done) => {
      try {
        const user = await User.getUserById(jwt_payload.data._id);

        if (user && User.isAdmin(user)) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );

  passport.use(
    'user',
    new JwtStrategy(opts, async(jwt_payload, done) => {
      try {
        const user = await User.getUserById(jwt_payload.data._id);

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    const sessionUser = {
      _id: user._id,
      email: user.email
    };

    done(null, sessionUser);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
};
