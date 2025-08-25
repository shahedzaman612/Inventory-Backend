// models/Item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true, trim: true }, // Custom ID
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Optional custom fields per item
    customFields: {
      stringFields: { type: [String], default: [] },
      numberFields: { type: [Number], default: [] },
      booleanFields: { type: [Boolean], default: [] },
      dropdownFields: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
itemSchema.index({ inventoryId: 1, userId: 1, itemId: 1 });

module.exports = mongoose.model("Item", itemSchema);
