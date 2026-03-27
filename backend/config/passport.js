const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const configurePassport = () => {
  // ── Local Strategy ──────────────────────────────────────────────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: false },
      async (email, password, done) => {
        try {
          // 1. Find the user by email
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user) {
            return done(null, false, { message: 'No account found with that email address.' });
          }

          // 2. Compare passwords
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password. Please try again.' });
          }

          // 3. Success
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ── Serialize: store only user ID in session ────────────────────────────────
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // ── Deserialize: fetch full user from DB on each request ───────────────────
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = configurePassport;
