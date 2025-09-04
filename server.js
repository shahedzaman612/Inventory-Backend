const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/database");
const passport = require("passport");
const session = require("express-session");

// Routes
const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");
const itemRoutes = require("./routes/item");
const inventoryDetailRoutes = require("./routes/inventoryDetail");

// Passport config
require("./config/passport")(passport);

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://myinventorybd.netlify.app",
        "http://localhost:3000",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Express session for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// OAuth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    // On success, redirect to frontend with JWT
    console.log("Authenticated user:", req.user);
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    console.log("Authenticated user:", req.user);
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

// Mount inventory routes (including search) first
app.use("/api/inventories", inventoryRoutes);

// Mount item routes under inventory
app.use("/api/inventories/:inventoryId/items", itemRoutes);

// Mount inventory detail routes
app.use("/api/inventories", inventoryDetailRoutes);

// Test route
app.get("/", (req, res) => res.send("Inventory Backend Running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
