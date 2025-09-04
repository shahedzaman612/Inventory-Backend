const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const passport = require("passport");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports = function (passport) {
  const generateToken = (user) => {
    return jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" }
    );
  };

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (!user) {
            user = new User({
              username: profile.displayName,
              email,
              password: "",
              isVerified: true,
              oauthProvider: "google",
            });
            await user.save();
          }

          const token = generateToken(user);
          const safeUser = user.toObject();
          safeUser.token = token;

          return done(null, safeUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("GitHub email not found"), null);

          let user = await User.findOne({ email });

          if (!user) {
            user = new User({
              username: profile.username,
              email,
              password: "",
              isVerified: true,
              oauthProvider: "github",
            });
            await user.save();
          }

          const token = generateToken(user);
          const safeUser = user.toObject();
          safeUser.token = token;

          return done(null, safeUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // Serialize/Deserialize
  passport.serializeUser((user, done) => {
    done(null, user); // ✅ serialize full user including token
  });

  passport.deserializeUser((user, done) => {
    done(null, user); // ✅ just return the same object
  });
};
