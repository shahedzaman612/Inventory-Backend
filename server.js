const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/database");

// Routes
const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");
const itemRoutes = require("./routes/item");
const inventoryDetailRoutes = require("./routes/inventoryDetail");

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

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/inventories/:inventoryId/items", itemRoutes);
app.use("/api/inventories", inventoryDetailRoutes);

// Test route
app.get("/", (req, res) => res.send("Inventory Backend Running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
