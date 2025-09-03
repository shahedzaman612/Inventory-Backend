const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const passport = require("passport");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports = function (passport) {
  // Helper to generate JWT
  const generateToken = (user) => {
    return jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" }
    );
  };

  // ================= GOOGLE STRATEGY =================
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (!user) {
            // Create new user
            user = new User({
              username: profile.displayName,
              email,
              password: "", // OAuth users don't have local password
              isVerified: true,
              oauthProvider: "google",
            });
            await user.save();
          }

          // Generate JWT
          const token = generateToken(user);
          user = user.toObject();
          user.token = token;

          return done(null, user);
        } catch (err) {
          console.error("Google OAuth Error:", err);
          return done(err, null);
        }
      }
    )
  );

  // ================= GITHUB STRATEGY =================
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // GitHub email may not be public
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
          user = user.toObject();
          user.token = token;

          return done(null, user);
        } catch (err) {
          console.error("GitHub OAuth Error:", err);
          return done(err, null);
        }
      }
    )
  );

  // ================= SERIALIZE / DESERIALIZE =================
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
