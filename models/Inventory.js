// models/Inventory.js
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "General", trim: true },
    tags: { type: [String], default: [] },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional custom fields
    customFields: {
      stringFields: { type: [String], default: [] },  // short strings
      textFields: { type: [String], default: [] },    // text blocks
      numberFields: { type: [Number], default: [] },
      linkFields: { type: [String], default: [] },
      booleanFields: { type: [Boolean], default: [] },
      dropdownFields: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

// Full-text search index
inventorySchema.index({
  title: "text",
  description: "text",
  "customFields.stringFields": "text",
  "customFields.textFields": "text",
  "customFields.dropdownFields": "text",
  category: "text",
  tags: "text",
});

module.exports = mongoose.model("Inventory", inventorySchema);
