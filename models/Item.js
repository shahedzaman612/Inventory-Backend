const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Flexible dynamic fields as plain object
    customFields: { type: Object, default: {} }, // ✅ changed from Map to Object
  },
  { timestamps: true }
);

itemSchema.index({ inventoryId: 1, userId: 1, itemId: 1 });

module.exports = mongoose.model("Item", itemSchema);
