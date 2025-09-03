const Item = require("../models/Item");
const Inventory = require("../models/Inventory");

// Add item
const addItem = async (req, res) => {
  const { itemId, name, quantity, customFields } = req.body;

  if (!itemId || !name || quantity === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const inventory = await Inventory.findById(req.params.inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const existingItem = await Item.findOne({ itemId });
    if (existingItem) {
      return res.status(409).json({ message: "Item ID already exists" });
    }

    // ✅ Save customFields as plain object
    const item = new Item({
      itemId,
      name,
      quantity,
      inventoryId: inventory._id,
      userId: req.user.id,
      customFields: customFields || {}, // object
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error("Add Item Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const inventory = await Inventory.findById(item.inventoryId);

    // Only inventory creator or admin can edit
    if (
      req.user.role !== "admin" &&
      inventory.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Update customFields as object
    if (req.body.customFields && typeof req.body.customFields === "object") {
      item.customFields = req.body.customFields;
    }

    // Update other fields
    if (req.body.itemId) item.itemId = req.body.itemId;
    if (req.body.name) item.name = req.body.name;
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Update Item Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const inventory = await Inventory.findById(item.inventoryId);

    // Only inventory creator or admin can delete
    if (
      req.user.role !== "admin" &&
      inventory.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete Item Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addItem, updateItem, deleteItem };
